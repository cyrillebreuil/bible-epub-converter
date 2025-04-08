const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");
const AdmZip = require("adm-zip");
const { XMLParser } = require("fast-xml-parser");

// Point d'entrée principal
async function main() {
    try {
        // Configuration
        const config = {
            epubPath: "./bible_liturgique.epub",
            translationInfo: {
                code: "aelf",
                name: "Traduction Officielle Liturgique",
                language: "Français",
                languageCode: "fra",
                regionCode: "FR",
            },
            debugMode: true,
            debugBooks: ["GEN"], // Pour tester uniquement certains livres
            debugChaptersLimit: 5, // Limiter le nombre de chapitres en debug
            saveDebugHtml: true,
            debugDir: "./debug",
            extractedDir: "./extracted_epub",
        };

        console.log(`Démarrage de l'extraction de ${config.epubPath}...`);

        // Créer les dossiers nécessaires
        await fs.ensureDir(config.debugDir);
        await fs.ensureDir(config.extractedDir);

        // Créer le convertisseur
        const converter = new BibleConverter(config);

        // Extraire le contenu
        await converter.extract();

        console.log("Extraction terminée avec succès!");
    } catch (error) {
        console.error("Erreur lors de l'extraction:", error);
        process.exit(1);
    }
}

class BibleConverter {
    constructor(config) {
        this.config = config;
        this.outputFile = `seed${config.translationInfo.code.toUpperCase()}.sql`;
        this.sqlStatements = [];
        this.bookMappings = this.initializeBookMappings();
        this.currentBook = null;
        this.processedChapters = new Set();
        this.processedBooks = new Set();
        this.processedVerses = new Map();
        this.bookNames = new Map();
        this.fileCache = new Map(); // Cache pour les fichiers HTML déjà lus
    }

    // Correspondances des noms de livres
    initializeBookMappings() {
        return {
            // Ancien Testament
            Genèse: "GEN",
            Exode: "EXO",
            Lévitique: "LEV",
            Nombres: "NUM",
            Deutéronome: "DEU",
            Josué: "JOS",
            Juges: "JDG",
            Ruth: "RUT",
            "1 Samuel": "1SA",
            "2 Samuel": "2SA",
            "1 Rois": "1KI",
            "2 Rois": "2KI",
            "1 Chroniques": "1CH",
            "2 Chroniques": "2CH",
            Esdras: "EZR",
            Néhémie: "NEH",
            Esther: "EST",
            Job: "JOB",
            Psaumes: "PSA",
            Proverbes: "PRO",
            Ecclésiaste: "ECC",
            "Cantique des Cantiques": "SNG",
            Ésaïe: "ISA",
            Jérémie: "JER",
            Lamentations: "LAM",
            Ézéchiel: "EZK",
            Daniel: "DAN",
            Osée: "HOS",
            Joël: "JOL",
            Amos: "AMO",
            Abdias: "OBA",
            Jonas: "JON",
            Michée: "MIC",
            Nahum: "NAM",
            Habacuc: "HAB",
            Sophonie: "ZEP",
            Aggée: "HAG",
            Zacharie: "ZEC",
            Malachie: "MAL",

            // Nouveau Testament
            Matthieu: "MAT",
            Marc: "MRK",
            Luc: "LUK",
            Jean: "JHN",
            Actes: "ACT",
            Romains: "ROM",
            "1 Corinthiens": "1CO",
            "2 Corinthiens": "2CO",
            Galates: "GAL",
            Éphésiens: "EPH",
            Philippiens: "PHP",
            Colossiens: "COL",
            "1 Thessaloniciens": "1TH",
            "2 Thessaloniciens": "2TH",
            "1 Timothée": "1TI",
            "2 Timothée": "2TI",
            Tite: "TIT",
            Philémon: "PHM",
            Hébreux: "HEB",
            Jacques: "JAS",
            "1 Pierre": "1PE",
            "2 Pierre": "2PE",
            "1 Jean": "1JN",
            "2 Jean": "2JN",
            "3 Jean": "3JN",
            Jude: "JUD",
            Apocalypse: "REV",
        };
    }

    async extract() {
        try {
            console.log(
                `Extraction directe du fichier EPUB: ${this.config.epubPath}`,
            );

            // Dézipper l'EPUB
            const zip = new AdmZip(this.config.epubPath);
            zip.extractAllTo(this.config.extractedDir, true);
            console.log(`EPUB extrait dans: ${this.config.extractedDir}`);

            // Trouver le fichier container.xml
            const containerPath = path.join(
                this.config.extractedDir,
                "META-INF",
                "container.xml",
            );
            const containerXml = await fs.readFile(containerPath, "utf8");

            // Parser le XML
            const parser = new XMLParser({
                ignoreAttributes: false,
                attributeNamePrefix: "@_",
            });

            const containerData = parser.parse(containerXml);

            // Trouver le chemin vers le fichier OPF
            const opfRelativePath =
                containerData.container.rootfiles.rootfile["@_full-path"];
            const opfPath = path.join(
                this.config.extractedDir,
                opfRelativePath,
            );

            console.log(`Fichier OPF trouvé: ${opfPath}`);

            const opfXml = await fs.readFile(opfPath, "utf8");
            const opfData = parser.parse(opfXml);

            // Extraire la table des matières et les métadonnées
            console.log("\nAnalyse des métadonnées de la Bible...");

            // Trouver le fichier NCX (table des matières)
            let items = opfData.package.manifest.item;
            if (!Array.isArray(items)) {
                items = [items];
            }

            // Chercher l'item de la table des matières
            let tocPath = null;
            for (const item of items) {
                if (
                    (item["@_id"] && item["@_id"].includes("toc")) ||
                    (item["@_id"] && item["@_id"].includes("ncx")) ||
                    (item["@_properties"] &&
                        item["@_properties"].includes("nav"))
                ) {
                    tocPath = path.join(path.dirname(opfPath), item["@_href"]);
                    break;
                }
            }

            if (!tocPath) {
                throw new Error("Table des matières introuvable dans l'EPUB");
            }

            console.log(`Table des matières identifiée: ${tocPath}`);

            // Créer un index des fichiers pour faciliter l'accès plus tard
            this.fileIndex = {};
            for (const item of items) {
                this.fileIndex[item["@_id"]] = {
                    href: item["@_href"],
                    fullPath: path.join(path.dirname(opfPath), item["@_href"]),
                };
            }

            // Définir le répertoire de base pour les fichiers HTML
            this.opfDir = path.dirname(opfPath);
            this.baseDir = this.opfDir;

            // Lire la table des matières
            const tocContent = await fs.readFile(tocPath, "utf8");

            // Si c'est un fichier NCX, parser différemment
            let tocItems = [];

            if (tocPath.endsWith(".ncx")) {
                console.log(
                    "Parsing du fichier NCX pour la table des matières",
                );
                const ncxData = parser.parse(tocContent);

                // Structure du NCX
                let navPoints = ncxData.ncx.navMap.navPoint;
                if (!Array.isArray(navPoints)) {
                    navPoints = [navPoints];
                }

                // Fonction récursive pour extraire les points de navigation
                const extractNavPoints = (points) => {
                    let results = [];
                    for (const point of points) {
                        const title = point.navLabel.text;
                        let href = point.content["@_src"];

                        results.push({ title, href });

                        // Si des sous-points existent, les extraire aussi
                        if (point.navPoint) {
                            let subPoints = point.navPoint;
                            if (!Array.isArray(subPoints)) {
                                subPoints = [subPoints];
                            }
                            results = [
                                ...results,
                                ...extractNavPoints(subPoints),
                            ];
                        }
                    }
                    return results;
                };

                tocItems = extractNavPoints(navPoints);
            } else {
                // Fichier HTML normal
                const $ = cheerio.load(tocContent);

                // Chercher les liens dans le document
                $("a").each((i, el) => {
                    const href = $(el).attr("href");
                    const title = $(el).text().trim();

                    if (href && title) {
                        tocItems.push({ title, href });
                    }
                });
            }

            console.log(
                `Nombre d'entrées dans la table des matières: ${tocItems.length}`,
            );

            // Déboguer les premières entrées
            if (this.config.debugMode) {
                console.log("\nPremières entrées de la table des matières:");
                tocItems.slice(0, 10).forEach((item, i) => {
                    console.log(`${i + 1}. ${item.title} (${item.href})`);
                });
            }

            // Commencer le fichier SQL
            this.startSqlFile();

            // Établir les noms préférés des livres (plus courts)
            this.setupPreferredBookNames();

            // Traiter les livres
            for (const tocItem of tocItems) {
                const bookInfo = this.identifyBook(tocItem.title);

                if (bookInfo) {
                    // Vérifier si on doit traiter ce livre en mode debug
                    if (
                        this.config.debugMode &&
                        this.config.debugBooks &&
                        this.config.debugBooks.length > 0 &&
                        !this.config.debugBooks.includes(bookInfo.id)
                    ) {
                        console.log(
                            `Livre ignoré (mode debug): ${bookInfo.name} (${bookInfo.id})`,
                        );
                        continue;
                    }

                    console.log(
                        `\nTraitement du livre: ${bookInfo.name} (${bookInfo.id})`,
                    );

                    // Mémoriser le livre courant
                    this.currentBook = bookInfo.id;

                    // Ajouter la traduction du livre
                    this.addBookTranslation(bookInfo.id, bookInfo.name);

                    // Traiter le contenu du livre
                    await this.processBookContent(tocItem.href, bookInfo.id);
                } else if (this.config.debugMode) {
                    console.log(
                        `Entrée non identifiée comme livre biblique: ${tocItem.title}`,
                    );
                }
            }

            // Finaliser le fichier SQL
            this.endSqlFile();

            // Écrire le fichier SQL
            await fs.writeFile(this.outputFile, this.sqlStatements.join("\n"));
            console.log(`\nFichier SQL généré: ${this.outputFile}`);
        } catch (error) {
            console.error("Erreur lors de l'extraction:", error);
            throw error;
        }
    }

    // Établir les noms préférés pour chaque livre (plus courts)
    setupPreferredBookNames() {
        // Préférer les noms courts
        this.bookNames.set("GEN", "Genèse");
        this.bookNames.set("EXO", "Exode");
        this.bookNames.set("LEV", "Lévitique");
        this.bookNames.set("NUM", "Nombres");
        this.bookNames.set("DEU", "Deutéronome");
        // Ajouter d'autres noms préférés si nécessaire...
    }

    // Commence le fichier SQL
    startSqlFile() {
        this.sqlStatements.push("BEGIN;");

        const { code, name, language, languageCode, regionCode } =
            this.config.translationInfo;

        this.sqlStatements.push(`
    INSERT INTO "translations" ("code", "name", "language", "languageCode", "regionCode") VALUES
    ('${code}', '${name}', '${language}', '${languageCode}', '${regionCode}')
    ON CONFLICT ("code") DO NOTHING;

    INSERT INTO "testamentTranslations" ("isNewTestament", "translationID", "name") VALUES
    (FALSE, (SELECT "id" FROM "translations" WHERE "code" = '${code}'), 'Ancien Testament'),
    (TRUE, (SELECT "id" FROM "translations" WHERE "code" = '${code}'), 'Nouveau Testament')
    ON CONFLICT ("isNewTestament", "translationID") DO NOTHING;
    `);
    }

    // Termine le fichier SQL
    endSqlFile() {
        this.sqlStatements.push("COMMIT;");
    }

    // Identifie un livre biblique
    identifyBook(title) {
        const cleanTitle = title.trim();

        // Cas particuliers pour cette Bible
        const specialCases = {
            "Livre de la Genèse": "GEN",
            "Livre de l'Exode": "EXO",
            "Livre des Lévites": "LEV",
            "Livre des Nombres": "NUM",
            "Livre du Deutéronome": "DEU",
            "Livre de Josué": "JOS",
            "Livre des Juges": "JDG",
            "Livre de Ruth": "RUT",
            "Premier Livre de Samuel": "1SA",
            "Deuxième Livre de Samuel": "2SA",
            "Premier livre des Rois": "1KI",
            "Deuxième livre des Rois": "2KI",
            "Premier Livre des Chroniques": "1CH",
            "Deuxième Livre des Chroniques": "2CH",
            "Livre d'Esdras": "EZR",
            "Livre de Néhémie": "NEH",
            "Livre d'Esther": "EST",
            "Livre de Job": "JOB",
            "Livre des Psaumes": "PSA",
            "Livre des Proverbes": "PRO",
            "Livre de Qohèleth": "ECC", // Ecclésiaste
            "Livre d'Isaïe": "ISA",
            "Livre de Jérémie": "JER",
            "Livre des Lamentations": "LAM",
            "Livre d'Ézékiel": "EZK",
            "Livre de Daniel": "DAN",
            "Livre d'Osée": "HOS",
            "Livre de Joël": "JOL",
            "Livre d'Amos": "AMO",
            "Livre d'Abdias": "OBA",
            "Livre de Jonas": "JON",
            "Livre de Michée": "MIC",
            "Livre de Nahoum": "NAM",
            "Livre d'Habacuc": "HAB",
            "Livre de Sophonie": "ZEP",
            "Livre d'Aggée": "HAG",
            "Livre de Zacharie": "ZEC",
            "Livre de Malachie": "MAL",
            "Évangile selon Saint Matthieu": "MAT",
            "Évangile selon Saint Marc": "MRK",
            "Évangile selon Saint Luc": "LUK",
            "Évangile selon Saint Jean": "JHN",
            "Actes des Apôtres": "ACT",
            "Lettre aux Romains": "ROM",
            "Première lettre aux Corinthiens": "1CO",
            "Deuxième lettre aux Corinthiens": "2CO",
            "Lettre aux Galates": "GAL",
            "Lettre aux Éphésiens": "EPH",
            "Lettre aux Philippiens": "PHP",
            "Lettre aux Colossiens": "COL",
            "Première lettre aux Thessaloniciens": "1TH",
            "Deuxième lettre aux Thessaloniciens": "2TH",
            "Première lettre à Timothée": "1TI",
            "Deuxième lettre à Timothée": "2TI",
            "Lettre à Tite": "TIT",
            "Lettre à Philémon": "PHM",
            "Lettre aux Hébreux": "HEB",
            "Lettre de saint Jacques": "JAS",
            "Première lettre de saint Pierre": "1PE",
            "Deuxième lettre de Saint Pierre": "2PE",
            "Première lettre de saint Jean": "1JN",
            "Deuxième lettre de saint Jean": "2JN",
            "Troisième lettre de saint Jean": "3JN",
            "Lettre de saint Jude": "JUD",
            "Livre de l'Apocalypse": "REV",
        };

        // Vérifier les cas spéciaux
        if (specialCases[cleanTitle]) {
            return {
                id: specialCases[cleanTitle],
                name: cleanTitle,
            };
        }

        // Correspondance directe avec le mapping existant
        if (this.bookMappings[cleanTitle]) {
            return {
                id: this.bookMappings[cleanTitle],
                name: cleanTitle,
            };
        }

        // Vérifier si le titre contient un nom de livre
        for (const [bookName, bookId] of Object.entries(this.bookMappings)) {
            // Éviter les correspondances trop courtes
            if (bookName.length < 3) continue;

            if (cleanTitle.includes(bookName)) {
                return {
                    id: bookId,
                    name: bookName,
                };
            }
        }

        return null;
    }

    // Ajoute la traduction d'un livre avec gestion des doublons
    addBookTranslation(bookId, bookName) {
        const { code } = this.config.translationInfo;

        // Vérifier si cette traduction de livre est déjà dans nos requêtes SQL
        const bookKey = `${bookId}-${code}`;

        if (!this.processedBooks.has(bookKey)) {
            // Marquer ce livre comme traité
            this.processedBooks.add(bookKey);

            // Utiliser le nom préféré s'il existe, sinon utiliser le nom d'origine
            let preferredName = this.bookNames.get(bookId);
            if (!preferredName) {
                // Pour les livres longs, préférer la version courte si possible
                if (bookName.startsWith("Livre de")) {
                    // Essayer de trouver une version courte
                    for (const [name, id] of Object.entries(
                        this.bookMappings,
                    )) {
                        if (id === bookId && name.length < bookName.length) {
                            preferredName = name;
                            break;
                        }
                    }
                }

                // Si toujours pas de nom préféré, utiliser le nom d'origine
                if (!preferredName) {
                    preferredName = bookName;
                }
            }

            const escapedName = preferredName.replace(/'/g, "''");

            this.sqlStatements.push(`
      INSERT INTO "bookTranslations" ("bookID", "translationID", "name") VALUES
      ('${bookId}', (SELECT "id" FROM "translations" WHERE "code" = '${code}'), '${escapedName}')
      ON CONFLICT ("bookID", "translationID") DO NOTHING;
      `);
        }
    }

    // Lire un fichier HTML avec gestion du cache
    async readHtmlFile(filePath) {
        // Vérifier si le fichier est déjà en cache
        if (this.fileCache.has(filePath)) {
            return this.fileCache.get(filePath);
        }

        try {
            // Essayer de lire le fichier
            const content = await fs.readFile(filePath, "utf8");
            // Mettre en cache
            this.fileCache.set(filePath, content);
            return content;
        } catch (error) {
            // Le chemin direct a échoué, essayer de reconstruire le chemin
            console.log(
                `Échec de lecture directe de ${filePath}, tentative de reconstruction du chemin...`,
            );

            // Extraire le nom du fichier et rechercher dans divers dossiers
            const fileName = path.basename(filePath);

            // Liste des répertoires potentiels
            const possibleDirs = [
                this.config.extractedDir,
                path.join(this.config.extractedDir, "OEBPS"),
                path.join(this.config.extractedDir, "text"),
                this.opfDir,
                path.join(this.opfDir, ".."),
            ];

            // Chercher le fichier dans chaque répertoire
            for (const dir of possibleDirs) {
                try {
                    const tryPath = path.join(dir, fileName);
                    console.log(`Essai avec le chemin: ${tryPath}`);
                    const content = await fs.readFile(tryPath, "utf8");
                    console.log(`Succès! Fichier trouvé à ${tryPath}`);
                    // Mettre en cache
                    this.fileCache.set(filePath, content);
                    this.fileCache.set(tryPath, content); // Cacher aussi avec le nouveau chemin
                    return content;
                } catch (err) {
                    // Continuer avec le prochain répertoire
                }
            }

            // Explorer récursivement pour trouver le fichier
            console.log(
                `Recherche récursive de ${fileName} dans ${this.config.extractedDir}...`,
            );
            const foundPath = await this.findFileRecursively(
                this.config.extractedDir,
                fileName,
            );

            if (foundPath) {
                console.log(`Fichier trouvé à ${foundPath}`);
                const content = await fs.readFile(foundPath, "utf8");
                // Mettre en cache
                this.fileCache.set(filePath, content);
                this.fileCache.set(foundPath, content);
                return content;
            }

            // Si toutes les tentatives échouent
            throw new Error(`Impossible de lire le fichier: ${filePath}`);
        }
    }

    // Trouve un fichier de manière récursive dans un répertoire
    async findFileRecursively(dir, fileName) {
        try {
            const files = await fs.readdir(dir);

            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = await fs.stat(filePath);

                if (stat.isDirectory()) {
                    // Recherche récursive dans le sous-répertoire
                    const result = await this.findFileRecursively(
                        filePath,
                        fileName,
                    );
                    if (result) return result;
                } else if (file === fileName || file.endsWith(fileName)) {
                    // Fichier trouvé
                    return filePath;
                }
            }
        } catch (err) {
            console.error(
                `Erreur lors de la recherche dans ${dir}:`,
                err.message,
            );
        }

        return null;
    }

    // Résout le chemin complet d'une URL relative
    resolveHtmlPath(href) {
        if (!href) return null;

        // Séparer le fragment du chemin
        const [hrefPath, fragment] = href.split("#");

        // Construire plusieurs possibilités de chemins
        const possiblePaths = [
            path.join(this.opfDir, hrefPath),
            path.join(this.config.extractedDir, hrefPath),
            path.join(this.config.extractedDir, "text", hrefPath),
            path.join(this.config.extractedDir, "OEBPS", hrefPath),
        ];

        // Retourner le premier chemin qui existe
        for (const testPath of possiblePaths) {
            if (fs.existsSync(testPath)) {
                return testPath;
            }
        }

        // Si aucun chemin n'existe, retourner le chemin par défaut
        return path.join(this.opfDir, hrefPath);
    }

    // Traite le contenu d'un livre
    async processBookContent(href, bookId) {
        try {
            console.log(`Lecture du fichier: ${href}`);

            // Résoudre le chemin du fichier
            const fullPath = this.resolveHtmlPath(href);

            // Lire le contenu du livre avec notre fonction améliorée
            let content;
            try {
                content = await this.readHtmlFile(fullPath);
            } catch (error) {
                console.error(
                    `Impossible de lire le fichier pour ${bookId}:`,
                    error.message,
                );
                return;
            }

            // Sauvegarder pour analyse
            if (this.config.saveDebugHtml) {
                await fs.writeFile(
                    path.join(this.config.debugDir, `${bookId}_content.html`),
                    content,
                );
                console.log(
                    `HTML sauvegardé dans ${this.config.debugDir}/${bookId}_content.html`,
                );
            }

            // Charger le contenu avec cheerio
            const $ = cheerio.load(content);

            // Scanner les liens vers les chapitres
            const chapterLinks = [];
            $("a.chaplink3").each((i, elem) => {
                const chapterNum = parseInt($(elem).text().trim(), 10);
                const chapterHref = $(elem).attr("href");
                if (chapterNum && chapterHref) {
                    chapterLinks.push({ chapterNum, href: chapterHref });
                    console.log(
                        `Trouvé lien vers chapitre ${chapterNum}: ${chapterHref}`,
                    );
                }
            });

            // Si des liens de chapitres ont été trouvés, les traiter
            if (chapterLinks.length > 0) {
                console.log(
                    `Traitement des chapitres via liens (${chapterLinks.length} chapitres trouvés)`,
                );
                await this.processBookChapters(bookId, chapterLinks);
                return;
            }

            // Sinon, chercher les chapitres directement dans le contenu
            console.log(
                "Pas de liens de chapitres trouvés, recherche de chapitres directement...",
            );

            const chapterElements = $(
                "span.intertitle10[id^='bib_']",
            ).toArray();

            if (chapterElements.length > 0) {
                console.log(
                    `Trouvé ${chapterElements.length} éléments de chapitres dans le document`,
                );
                await this.processDirectChapters($, bookId, chapterElements);
                return;
            }

            console.log(
                "Aucun chapitre trouvé dans le document principal, tentative avec méthode de secours...",
            );
            await this.extractAllVerses($, bookId);
        } catch (error) {
            console.error(
                `Erreur lors du traitement de ${bookId} (${href}):`,
                error.message,
            );
        }
    }

    // Traite les chapitres d'un livre via leurs liens
    async processBookChapters(bookId, chapterLinks) {
        // Limite le nombre de chapitres en mode debug
        const chaptersToProcess = this.config.debugChaptersLimit
            ? chapterLinks.slice(0, this.config.debugChaptersLimit)
            : chapterLinks;

        console.log(
            `Traitement de ${chaptersToProcess.length} chapitres sur ${chapterLinks.length}`,
        );

        // Trier les chapitres par numéro pour éviter les confusions
        chaptersToProcess.sort((a, b) => a.chapterNum - b.chapterNum);

        // Traiter chaque chapitre
        for (const { chapterNum, href } of chaptersToProcess) {
            try {
                console.log(
                    `Traitement du chapitre ${chapterNum} via lien: ${href}`,
                );

                // Éviter le traitement en double des chapitres
                const chapterKey = `${bookId}-${chapterNum}`;
                if (this.processedChapters.has(chapterKey)) {
                    console.log(`Chapitre ${chapterNum} déjà traité, ignoré.`);
                    continue;
                }

                // Séparer le chemin et le fragment
                const [pathPart, fragment] = href.split("#");

                // Résoudre le chemin complet du fichier
                let resolvedPath;

                if (pathPart) {
                    resolvedPath = this.resolveHtmlPath(pathPart);
                } else if (fragment) {
                    // Si pas de chemin, utiliser le fragment pour trouver dans le document actuel
                    console.log(
                        `Pas de chemin dans le lien, utilisation du fragment: ${fragment}`,
                    );
                    resolvedPath = null;
                }

                if (resolvedPath) {
                    console.log(`Chemin résolu: ${resolvedPath}`);

                    try {
                        // Lire le contenu du chapitre
                        const chapterContent =
                            await this.readHtmlFile(resolvedPath);

                        // Charger le contenu avec cheerio
                        const $ = cheerio.load(chapterContent);

                        // Filtrer le contenu du chapitre pour éviter de mélanger les chapitres
                        this.isolateChapterContent($, bookId, chapterNum, fragment);

                        // Déboguer : sauvegarder le HTML du chapitre
                        if (this.config.saveDebugHtml) {
                            const debugFileName = `${bookId}_${chapterNum}.html`;

                            // Isoler spécifiquement ce chapitre pour le debugging
                            const $debugCopy = cheerio.load(chapterContent);

                            // Chercher l'élément du chapitre et ses contenus
                            const $chapterElement = $debugCopy(`#${fragment}`);

                            if ($chapterElement.length) {
                                // Créer un nouvel HTML contenant uniquement ce chapitre
                                const $debugContainer = $debugCopy('<div></div>');

                                // Ajouter les infos du chapitre
                                $debugContainer.append(`<h1>Chapitre ${chapterNum} de ${bookId}</h1>`);

                                // Ajouter l'élément du chapitre et son contenu
                                $debugContainer.append($chapterElement);

                                // Trouver tous les versets associés à ce chapitre
                                const bookLower = bookId.toLowerCase();
                                const genPrefix = bookId === "GEN" ? `bib_gn_${chapterNum}_` : null;
                                const bookPrefix = `bib_${bookLower}_${chapterNum}_`;

                                let verseElements;
                                if (genPrefix) {
                                    verseElements = $debugCopy(`a[id^='${genPrefix}'], a[id^='${bookPrefix}']`).closest('p');
                                } else {
                                    verseElements = $debugCopy(`a[id^='${bookPrefix}']`).closest('p');
                                }

                                $debugContainer.append(verseElements);

                                // Sauvegarder uniquement le contenu filtré
                                await fs.writeFile(
                                    path.join(this.config.debugDir, debugFileName),
                                    $debugContainer.html()
                                );
                            } else {
                                // Si on ne trouve pas l'élément spécifique, sauvegarder tout le HTML mais avec un indicateur
                                await fs.writeFile(
                                    path.join(this.config.debugDir, debugFileName),
                                    `<!-- Chapitre complet, élément spécifique non trouvé -->\n${$.html()}`
                                );
                            }

                            console.log(`HTML du chapitre sauvegardé: ${debugFileName}`);
                        }

                        // Marquer ce chapitre comme traité
                        this.processedChapters.add(chapterKey);

                        // Trouver l'élément du chapitre en utilisant le fragment comme ID
                        if (fragment) {
                            const chapterElement = $(`#${fragment}`);

                            if (chapterElement.length > 0) {
                                console.log(
                                    `Élément de chapitre trouvé avec ID: ${fragment}`,
                                );
                                await this.extractVersetsFromChapter(
                                    $,
                                    bookId,
                                    chapterNum,
                                    chapterElement,
                                );
                            } else {
                                console.log(
                                    `Élément de chapitre non trouvé avec ID: ${fragment}, extraction générale...`,
                                );
                                await this.extractVersetsFromChapter(
                                    $,
                                    bookId,
                                    chapterNum,
                                );
                            }
                        } else {
                            // Pas de fragment, extraire tous les versets du document
                            await this.extractVersetsFromChapter(
                                $,
                                bookId,
                                chapterNum,
                            );
                        }
                    } catch (error) {
                        console.error(
                            `Erreur lors du traitement du fichier pour le chapitre ${chapterNum}:`,
                            error.message,
                        );
                    }
                } else if (fragment) {
                    // Pas de chemin mais un fragment, chercher dans le document courant
                    console.log(
                        `Tentative d'extraction avec le fragment ${fragment} dans le document courant`,
                    );
                    // Cette logique serait implémentée si nécessaire
                }
            } catch (error) {
                console.error(
                    `Erreur lors du traitement du chapitre ${chapterNum}:`,
                    error.message,
                );
            }
        }
    }

    // Isoler le contenu d'un chapitre pour éviter les mélanges
    isolateChapterContent($, bookId, chapterNum, fragment) {
        const bookLower = bookId.toLowerCase();
        // IDs spécifiques au chapitre courant
        const idPrefix = `bib_${bookLower}_${chapterNum}_`;
        const chapterIdPrefix = `bib_${bookLower}_${chapterNum}`;

        // Cas particulier pour la Genèse (utilise gn au lieu de gen)
        const genIdPrefix = bookId === "GEN" ? `bib_gn_${chapterNum}_` : null;
        const genChapterIdPrefix = bookId === "GEN" ? `bib_gn_${chapterNum}` : null;

        // 1. Supprimer toutes les balises h3 et autres titres qui perturbent l'extraction
        $("h3.intertitle9, .invisible").each(function() {
            $(this).remove();
        });

        // 2. Garder seulement les ancres qui appartiennent à ce chapitre
        $("a[id^='bib_']").each(function() {
            const id = $(this).attr('id');

            // Si c'est une ancre d'un autre chapitre, la supprimer
            const belongsToThisChapter =
                id === chapterIdPrefix ||
                id.startsWith(idPrefix) ||
                (genIdPrefix && id === genChapterIdPrefix) ||
                (genIdPrefix && id.startsWith(genIdPrefix));

            if (!belongsToThisChapter) {
                $(this).remove();
            }
        });
    }

    // Traite les chapitres trouvés directement dans un document
    async processDirectChapters($, bookId, chapterElements) {
        // Limite le nombre de chapitres en mode debug
        const chaptersToProcess = this.config.debugChaptersLimit
            ? chapterElements.slice(0, this.config.debugChaptersLimit)
            : chapterElements;

        console.log(
            `Traitement de ${chaptersToProcess.length} chapitres directs`,
        );

        // Traiter chaque chapitre
        for (const chapterElem of chaptersToProcess) {
            const chapterId = $(chapterElem).attr("id");
            const parts = chapterId.split("_");

            if (parts.length >= 3) {
                const chapterNum = parseInt(parts[2], 10);

                if (!isNaN(chapterNum)) {
                    console.log(
                        `Traitement du chapitre ${chapterNum} (${chapterId})`,
                    );

                    // Éviter le traitement en double des chapitres
                    const chapterKey = `${bookId}-${chapterNum}`;
                    if (this.processedChapters.has(chapterKey)) {
                        console.log(
                            `Chapitre ${chapterNum} déjà traité, ignoré.`,
                        );
                        continue;
                    }

                    // Marquer ce chapitre comme traité
                    this.processedChapters.add(chapterKey);

                    // Extraire les versets de ce chapitre
                    await this.extractVersetsFromChapter(
                        $,
                        bookId,
                        chapterNum,
                        $(chapterElem),
                    );
                }
            }
        }
    }

    // Extrait les versets d'un chapitre
    async extractVersetsFromChapter(
        $,
        bookId,
        chapterNum,
        chapterElement = null,
    ) {
        console.log(`Extraction des versets du chapitre ${chapterNum}...`);

        // Initialiser le suivi des versets pour ce chapitre
        const chapterKey = `${bookId}-${chapterNum}`;
        if (!this.processedVerses.has(chapterKey)) {
            this.processedVerses.set(chapterKey, new Set());
        }

        // Ajouter une entrée pour le chapitre si ce n'est pas déjà fait
        if (!this.processedChapters.has(chapterKey)) {
            this.addChapter(bookId, chapterNum);
            this.processedChapters.add(chapterKey);
        }

        // D'abord, extraire les versets des paragraphes contenant plusieurs ancres
        const paragraphsWithMultiAnchors = [];

        // Chercher les paragraphes qui contiennent plusieurs ancres de versets pour ce chapitre
        const bookLower = bookId.toLowerCase();
        const genPrefix = bookId === "GEN" ? `bib_gn_${chapterNum}_` : null;
        const bookPrefix = `bib_${bookLower}_${chapterNum}_`;

        $("p").each((i, para) => {
            const paragraph = $(para);
            let versetsAnchors = [];

            if (genPrefix) {
                versetsAnchors = paragraph.find(`a[id^='${genPrefix}'], a[id^='${bookPrefix}']`);
            } else {
                versetsAnchors = paragraph.find(`a[id^='${bookPrefix}']`);
            }

            if (versetsAnchors.length > 1) {
                paragraphsWithMultiAnchors.push(paragraph);
            }
        });

        console.log(`Trouvé ${paragraphsWithMultiAnchors.length} paragraphes avec multiples ancres`);

        // Traiter les paragraphes avec plusieurs versets
        for (const paragraph of paragraphsWithMultiAnchors) {
            await this.extractVersetsFromMultiAnchorParagraph($, paragraph, bookId, chapterNum);
        }

        // Rechercher toutes les ancres de versets pour ce chapitre qui n'ont pas encore été traitées
        let verseAnchors;

        if (bookId === "GEN") {
            // Pour Genèse, utiliser un identificateur spécial (tester avec gn)
            verseAnchors = $(
                `a.anchor[id^='bib_gn_${chapterNum}_'], a.anchor1[id^='bib_gn_${chapterNum}_'], a.anchor2[id^='bib_gn_${chapterNum}_'], a.anchor3[id^='bib_gn_${chapterNum}_']`,
            );
        } else {
            // Pour les autres livres, utiliser l'ID standard
            verseAnchors = $(
                `a.anchor[id^='bib_${bookLower}_${chapterNum}_'], a.anchor1[id^='bib_${bookLower}_${chapterNum}_'], a.anchor2[id^='bib_${bookLower}_${chapterNum}_'], a.anchor3[id^='bib_${bookLower}_${chapterNum}_']`,
            );
        }

        console.log(
            `Trouvé ${verseAnchors.length} ancres de versets individuelles dans le chapitre ${chapterNum}`,
        );

        let versesFound = 0;

        // Parcourir chaque ancre de verset
        verseAnchors.each((i, anchor) => {
            try {
                const anchorId = $(anchor).attr("id");
                const parts = anchorId.split("_");
                const verseNum = parseInt(parts[parts.length - 1], 10);

                if (isNaN(verseNum)) return;

                // Vérifier si ce verset a déjà été traité
                if (this.processedVerses.get(chapterKey).has(verseNum)) {
                    return;
                }

                // Extraire le texte du verset
                const verseText = this.extractVerseTextFromAnchor($, anchor, verseNum);

                if (verseText) {
                    // Nettoyer et ajouter le verset
                    const cleanText = this.finalizeVerseText(verseText);
                    this.addVerse(bookId, chapterNum, verseNum, cleanText);
                    versesFound++;

                    console.log(
                        `  Verset ${verseNum}: "${cleanText.substring(0, 50)}${cleanText.length > 50 ? "..." : ""}"`,
                    );
                } else {
                    console.warn(
                        `  Impossible d'extraire le texte pour le verset ${chapterNum}:${verseNum}`,
                    );
                }
            } catch (error) {
                console.error(`Erreur lors de l'extraction du verset:`, error);
            }
        });

        // S'il n'y a pas d'ancres de versets, essayer d'autres méthodes
        if (verseAnchors.length === 0) {
            // Essayer de trouver les versets avec calibre17
            const calibre17Elements = $("b.calibre17");

            if (calibre17Elements.length > 0) {
                console.log(
                    `Trouvé ${calibre17Elements.length} éléments calibre17`,
                );
                await this.extractVersetsWithCalibre17($, bookId, chapterNum);
            } else {
                console.log(
                    "Aucun élément calibre17 trouvé, versets non extraits pour ce chapitre",
                );
            }
        }

        console.log(`Chapitre ${chapterNum}: ${versesFound} versets trouvés`);

        // Vérifier les versets manquants
        this.checkForMissingVerses($, bookId, chapterNum);
    }

    // Extrait les versets d'un paragraphe contenant plusieurs ancres
    async extractVersetsFromMultiAnchorParagraph($, paragraph, bookId, chapterNum) {
        const bookLower = bookId.toLowerCase();
        const genPrefix = bookId === "GEN" ? `bib_gn_${chapterNum}_` : null;
        const bookPrefix = `bib_${bookLower}_${chapterNum}_`;

        // Trouver toutes les ancres de versets dans ce paragraphe
        let versetsAnchors = [];
        if (genPrefix) {
            versetsAnchors = paragraph.find(`a[id^='${genPrefix}'], a[id^='${bookPrefix}']`);
        } else {
            versetsAnchors = paragraph.find(`a[id^='${bookPrefix}']`);
        }

        if (versetsAnchors.length <= 0) return;

        console.log(`Paragraphe avec ${versetsAnchors.length} ancres détecté`);

        // Trier les ancres par ordre de verset
        const anchorArray = versetsAnchors.toArray();
        anchorArray.sort((a, b) => {
            const idA = $(a).attr('id');
            const idB = $(b).attr('id');
            const partsA = idA.split('_');
            const partsB = idB.split('_');
            const verseNumA = parseInt(partsA[partsA.length - 1], 10);
            const verseNumB = parseInt(partsB[partsB.length - 1], 10);
            return verseNumA - verseNumB;
        });

        // Traiter chaque ancre et extraire son texte
        for (let i = 0; i < anchorArray.length; i++) {
            const anchor = anchorArray[i];
            const anchorId = $(anchor).attr('id');
            const parts = anchorId.split('_');
            const verseNum = parseInt(parts[parts.length - 1], 10);

            if (isNaN(verseNum)) continue;

            // Vérifier si ce verset a déjà été traité
            const chapterKey = `${bookId}-${chapterNum}`;
            if (this.processedVerses.get(chapterKey)?.has(verseNum)) {
                continue;
            }

            // Extraire le texte du verset
            let verseText = "";

            // Créer une copie du paragraphe pour manipulation
            const $clone = paragraph.clone();

            // Supprimer les annotations
            $clone.find("sup").remove();

            // Si c'est le dernier verset du paragraphe
            if (i === anchorArray.length - 1) {
                // Supprimer tout ce qui précède cette ancre
                const currentAnchorHtml = $(anchor).prop('outerHTML');
                const htmlParts = $clone.html().split(currentAnchorHtml);

                if (htmlParts.length > 1) {
                    // Créer un DOM temporaire avec ce qui suit cette ancre
                    const temp = $("<div></div>").html(htmlParts[1]);

                    // Collecter le texte des éléments calibre17
                    temp.find("b.calibre17").each((j, elem) => {
                        verseText += $(elem).text() + " ";
                    });

                    // Si pas d'éléments calibre17, prendre tout le texte
                    if (!verseText.trim() && temp.text().trim()) {
                        verseText = temp.text().trim();
                    }
                }
            } else {
                // Ce n'est pas le dernier verset
                const nextAnchor = anchorArray[i + 1];
                const currentAnchorHtml = $(anchor).prop('outerHTML');
                const nextAnchorHtml = $(nextAnchor).prop('outerHTML');

                // Extraire le HTML complet du paragraphe
                const fullHtml = $clone.html();

                // Diviser par l'ancre actuelle
                const firstSplit = fullHtml.split(currentAnchorHtml);

                if (firstSplit.length > 1) {
                    // Diviser la seconde partie par l'ancre suivante
                    const secondSplit = firstSplit[1].split(nextAnchorHtml);

                    if (secondSplit.length > 0) {
                        // Obtenir le texte entre les deux ancres
                        const temp = $("<div></div>").html(secondSplit[0]);

                        // Collecter le texte des éléments calibre17
                        temp.find("b.calibre17").each((j, elem) => {
                            verseText += $(elem).text() + " ";
                        });

                        // Si pas d'éléments calibre17, prendre tout le texte
                        if (!verseText.trim() && temp.text().trim()) {
                            verseText = temp.text().trim();
                        }
                    }
                }
            }

            // Si nous avons extrait du texte, le nettoyer et l'ajouter
            if (verseText.trim()) {
                const cleanText = this.finalizeVerseText(verseText);
                this.addVerse(bookId, chapterNum, verseNum, cleanText);

                console.log(`  Verset ${verseNum} extrait du paragraphe multi-ancre: "${cleanText.substring(0, 50)}${cleanText.length > 50 ? "..." : ""}"`);

                // Marquer ce verset comme traité
                const chapterKey = `${bookId}-${chapterNum}`;
                if (!this.processedVerses.has(chapterKey)) {
                    this.processedVerses.set(chapterKey, new Set());
                }
                this.processedVerses.get(chapterKey).add(verseNum);
            }
        }
    }

    // Extrait le texte d'un verset à partir de son ancre
    extractVerseTextFromAnchor($, anchor, verseNum) {
        const collectText = (elem) => {
            const $clone = $(elem).clone();
            $clone.find("sup").remove();
            return $clone.text().trim();
        };

        let verseText = "";
        const parentElem = $(anchor).parent();

        // 1. Si c'est une ancre de type anchor standard
        if ($(anchor).hasClass("anchor")) {
            // Collecter le texte de cet élément et des retraits qui suivent
            if (parentElem.find("b.calibre17").length > 0) {
                parentElem.find("b.calibre17").each((i, elem) => {
                    verseText += collectText(elem) + " ";
                });
            }

            // Si c'est un paragraphe avec retraits
            if (
                parentElem.hasClass("verset_anchor") ||
                parentElem.hasClass("verset_no_anchor")
            ) {
                let nextElem = parentElem.next();

                // Collecter les retraits suivants jusqu'à trouver une autre ancre ou un titre
                while (
                    nextElem.length &&
                    (nextElem.hasClass("retrait") ||
                     nextElem.hasClass("retrait1") ||
                     nextElem.hasClass("retrait2") ||
                     nextElem.hasClass("verset_no_anchor")) &&
                    !nextElem.find("a.anchor, a.anchor1, a.anchor2, a.anchor3").length &&
                    !nextElem.hasClass("intertitle9")
                ) {
                    nextElem.find("b.calibre17").each((i, elem) => {
                        verseText += collectText(elem) + " ";
                    });

                    nextElem = nextElem.next();
                }
            }
        }
        // 2. Si c'est une ancre de type anchor1, anchor2, anchor3
        else if ($(anchor).hasClass("anchor1") || $(anchor).hasClass("anchor2") || $(anchor).hasClass("anchor3")) {
            // Ces ancres sont généralement dans un paragraphe contenant plusieurs versets
            // Nous devons extraire uniquement le texte qui appartient à ce verset

            // Trouver tous les éléments calibre17 après cette ancre et avant la prochaine ancre
            const paragraph = $(anchor).closest("p");
            const anchorId = $(anchor).attr("id");
            const fullHtml = paragraph.html();

            // Trouver la position de l'ancre dans le paragraphe
            const parts = fullHtml.split($(anchor).prop('outerHTML'));

            if (parts.length > 1) {
                // Créer un DOM temporaire pour manipuler le contenu après l'ancre
                const $afterAnchor = $("<div></div>").html(parts[1]);

                // Trouver la prochaine ancre
                const nextAnchor = $afterAnchor.find("a.anchor1, a.anchor2, a.anchor3").first();

                if (nextAnchor.length) {
                    // Il y a une autre ancre, obtenir le texte jusqu'à cette ancre
                    const nextAnchorHtml = nextAnchor.prop('outerHTML');
                    const beforeNextParts = $afterAnchor.html().split(nextAnchorHtml);

                    if (beforeNextParts.length > 0) {
                        const $textBeforeNext = $("<div></div>").html(beforeNextParts[0]);

                        // Supprimer les annotations
                        $textBeforeNext.find("sup").remove();

                        // Collecter le texte des éléments calibre17
                        $textBeforeNext.find("b.calibre17").each((i, elem) => {
                            verseText += $(elem).text() + " ";
                        });

                        // Si pas de texte calibre17, prendre tout le texte
                        if (!verseText.trim() && $textBeforeNext.text().trim()) {
                            verseText = $textBeforeNext.text().trim();
                        }
                    }
                } else {
                    // C'est la dernière ancre, prendre tout le texte restant
                    $afterAnchor.find("sup").remove();

                    // Collecter le texte des éléments calibre17
                    $afterAnchor.find("b.calibre17").each((i, elem) => {
                        verseText += $(elem).text() + " ";
                    });

                    // Si pas de texte calibre17, prendre tout le texte
                    if (!verseText.trim() && $afterAnchor.text().trim()) {
                        verseText = $afterAnchor.text().trim();
                    }
                }
            }
        }

        // Si nous n'avons pas trouvé de texte, essayer une recherche générale
        if (!verseText.trim()) {
            // Rechercher dans le texte complet en utilisant le numéro de verset
            const bodyText = $("body").text();
            const pattern = new RegExp(`\\b${verseNum}\\s+([A-ZÉÈÊÀÂÇÙÛÔÏ].*?)(?=\\s+(?:\\d{1,3})\\s+[A-ZÉÈÊÀÂÇÙÛÔÏ]|$)`, "s");
            const match = bodyText.match(pattern);

            if (match && match[1]) {
                verseText = match[1].trim();

                // Nettoyer les annotations
                verseText = verseText.replace(/\([a-z]+\)/g, "");
            }
        }

        return verseText.trim();
    }

    // Ajoute un chapitre à la base de données
    addChapter(bookId, chapterNum) {
        const { code } = this.config.translationInfo;

        this.sqlStatements.push(`
    INSERT INTO "chapters" ("bookID", "number") VALUES
    ('${bookId}', ${chapterNum})
    ON CONFLICT ("bookID", "number") DO NOTHING;
    `);
    }

    // Extraction des versets avec calibre17
    async extractVersetsWithCalibre17($, bookId, chapterNum) {
        console.log(
            `Tentative d'extraction des versets avec la classe calibre17...`,
        );

        // Initialiser le suivi des versets
        const chapterKey = `${bookId}-${chapterNum}`;
        if (!this.processedVerses.has(chapterKey)) {
            this.processedVerses.set(chapterKey, new Set());
        }

        // Ajouter une entrée pour le chapitre seulement si ce n'est pas déjà fait
        if (!this.processedChapters.has(chapterKey)) {
            this.addChapter(bookId, chapterNum);
            this.processedChapters.add(chapterKey);
        }

        // Rechercher tous les éléments avec class="calibre17"
        const calibre17Elements = $("b.calibre17");
        console.log(`Trouvé ${calibre17Elements.length} éléments calibre17`);

        if (calibre17Elements.length === 0) {
            return 0;
        }

        // Trouver les éléments qui contiennent les versets
        let versesFound = 0;
        const verseNumbers = [];

        // Première passe: identifier les numéros de versets
        $("body")
            .text()
            .replace(/\b(\d+)\s+[A-ZÉÈÊÀÂÇÙÛÔÏ]/g, (match, num) => {
                const verseNum = parseInt(num, 10);
                if (!isNaN(verseNum) && verseNum > 0 && verseNum < 200) {
                    // Limite raisonnable
                    verseNumbers.push(verseNum);
                }
                return match;
            });

        console.log(
            `Numéros de versets identifiés: ${verseNumbers.length > 0 ? verseNumbers.join(", ") : "aucun"}`,
        );

        // Deuxième passe: extraire le texte pour chaque numéro de verset
        for (const verseNum of verseNumbers) {
            // Vérifier si ce verset a déjà été traité
            if (this.processedVerses.get(chapterKey).has(verseNum)) {
                continue;
            }

            // Trouver le texte du verset
            let verseText = "";
            const parentElements = [];

            // Chercher l'élément contenant le numéro de verset
            $("body")
                .contents()
                .each(function () {
                    const text = $(this).text();
                    if (
                        text.match(
                            new RegExp(`\\b${verseNum}\\s+[A-ZÉÈÊÀÂÇÙÛÔÏ]`),
                        )
                    ) {
                        parentElements.push($(this));
                    }
                });

            if (parentElements.length > 0) {
                // Pour chaque élément parent trouvé
                for (const parent of parentElements) {
                    // Collecter le texte des éléments calibre17
                    parent.find("b.calibre17").each((i, elem) => {
                        // Cloner l'élément et supprimer les balises sup
                        const $clone = $(elem).clone();
                        $clone.find("sup").remove();
                        verseText += $clone.text() + " ";
                    });

                    // Si du texte a été trouvé, sortir de la boucle
                    if (verseText.trim()) break;
                }
            }

            // Si du texte a été trouvé, l'ajouter
            if (verseText.trim()) {
                const cleanText = this.finalizeVerseText(verseText);
                this.addVerse(bookId, chapterNum, verseNum, cleanText);
                versesFound++;
                console.log(
                    `  Verset ${verseNum}: "${cleanText.substring(0, 50)}${cleanText.length > 50 ? "..." : ""}"`,
                );
            }
        }

        console.log(
            `Extraction avec calibre17: ${versesFound} versets trouvés pour le chapitre ${chapterNum}`,
        );
        return versesFound;
    }

    // Nettoyage final du texte d'un verset
    finalizeVerseText(text) {
        if (!text) return "";

        // Suppression du numéro de verset au début si présent
        let cleanText = text.replace(/^\d+\s*/, "");

        // Supprimer toutes les annotations de type (a), (b), etc.
        cleanText = cleanText.replace(/\([a-z]+\)/g, "");

        // Supprimer les titres de section qui pourraient s'être glissés dans le texte
        cleanText = cleanText.replace(/(?:Second|Premier|Deuxième|Troisième|Quatrième|Cinquième|Sixième|Septième)\s+récit.*?(?

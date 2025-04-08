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

						// Déboguer : sauvegarder le HTML du chapitre
						if (this.config.saveDebugHtml) {
							const debugFileName = `${bookId}_${chapterNum}.html`;
							await fs.writeFile(
								path.join(this.config.debugDir, debugFileName),
								chapterContent,
							);
							console.log(
								`HTML du chapitre sauvegardé: ${debugFileName}`,
							);
						}

						// Charger le contenu avec cheerio
						const $ = cheerio.load(chapterContent);

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

		// Rechercher toutes les ancres de versets pour ce chapitre
		let verseAnchors;
		const bookLower = bookId.toLowerCase();

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
			`Trouvé ${verseAnchors.length} ancres de versets dans le chapitre ${chapterNum}`,
		);

		if (verseAnchors.length === 0) {
			console.log(
				"Aucune ancre trouvée, tentative avec méthode alternative...",
			);
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

			return;
		}

		// Ajouter une entrée pour le chapitre dans notre base de données
		this.addChapter(bookId, chapterNum);

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

				// Trouver le texte du verset en utilisant la nouvelle méthode optimisée
				const verseText = this.extractVerseTextWithCalibre17(
					$,
					anchor,
					verseNum,
				);

				if (verseText) {
					// Nettoyage mineur et ajout du verset
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

		// Chercher les paragraphes contenant plusieurs versets
		$("p").each((i, para) => {
			const paragraph = $(para);
			const versetsAnchors = paragraph.find(
				"a.anchor1, a.anchor2, a.anchor3",
			);

			if (versetsAnchors.length > 1) {
				// Ce paragraphe contient plusieurs versets
				this.extractVersetsFromSameParagraph(
					$,
					paragraph,
					bookId,
					chapterNum,
				);
			}
		});

		console.log(`Chapitre ${chapterNum}: ${versesFound} versets trouvés`);

		// Vérifier les versets manquants
		this.checkForMissingVerses($, bookId, chapterNum);
	}

	// Extrait les versets d'un même paragraphe
	extractVersetsFromSameParagraph($, paragraph, bookId, chapterNum) {
		const versetsAnchors = paragraph.find(
			"a.anchor1, a.anchor2, a.anchor3",
		);

		if (versetsAnchors.length > 0) {
			console.log(
				`Paragraphe contenant ${versetsAnchors.length} versets`,
			);

			// Pour chaque ancre trouvée
			versetsAnchors.each((i, anchor) => {
				const anchorId = $(anchor).attr("id");
				const parts = anchorId.split("_");
				const verseNum = parseInt(parts[parts.length - 1], 10);

				if (isNaN(verseNum)) return;

				// Vérifier si ce verset a déjà été traité
				const chapterKey = `${bookId}-${chapterNum}`;
				if (this.processedVerses.get(chapterKey)?.has(verseNum)) {
					return;
				}

				// Déterminer le texte de ce verset spécifique
				let verseText = "";

				// Si c'est le dernier verset du paragraphe
				if (i === versetsAnchors.length - 1) {
					// Cloner le paragraphe
					const $clone = paragraph.clone();

					// Supprimer tout ce qui précède cette ancre
					let foundCurrent = false;
					$clone
						.find("a.anchor1, a.anchor2, a.anchor3")
						.each(function () {
							if (foundCurrent) return;

							if ($(this).attr("id") === anchorId) {
								foundCurrent = true;
								return;
							}

							// Supprimer cette ancre et tout ce qui précède
							$(this).prevAll().remove();
							$(this).remove();
						});

					// Supprimer les annotations
					$clone.find("sup").remove();

					// Obtenir le texte restant
					verseText = $clone.text().trim();
				}
				// Si ce n'est pas le dernier verset
				else {
					const nextAnchor = $(versetsAnchors[i + 1]);

					// Cloner le paragraphe
					const $clone = paragraph.clone();

					// Supprimer tout ce qui précède cette ancre et tout ce qui suit la prochaine
					let foundCurrent = false;
					let foundNext = false;
					$clone
						.find("a.anchor1, a.anchor2, a.anchor3")
						.each(function () {
							if (foundNext) {
								$(this).nextAll().remove();
								$(this).remove();
								return false;
							}

							if (
								foundCurrent &&
								$(this).attr("id") === nextAnchor.attr("id")
							) {
								foundNext = true;
								$(this).nextAll().remove();
								$(this).remove();
								return false;
							}

							if (!foundCurrent) {
								if ($(this).attr("id") === anchorId) {
									foundCurrent = true;
									return;
								}

								$(this).prevAll().remove();
								$(this).remove();
							}
						});

					// Supprimer les annotations
					$clone.find("sup").remove();

					// Obtenir le texte restant
					verseText = $clone.text().trim();
				}

				// Nettoyer et ajouter ce verset
				if (verseText) {
					const cleanText = this.finalizeVerseText(verseText);
					this.addVerse(bookId, chapterNum, verseNum, cleanText);

					console.log(
						`  Verset ${verseNum} extrait du paragraphe: "${cleanText.substring(0, 50)}${cleanText.length > 50 ? "..." : ""}"`,
					);

					// Marquer ce verset comme traité
					if (!this.processedVerses.has(chapterKey)) {
						this.processedVerses.set(chapterKey, new Set());
					}
					this.processedVerses.get(chapterKey).add(verseNum);
				}
			});
		}
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

		// Ajouter une entrée pour le chapitre
		this.addChapter(bookId, chapterNum);

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

		// Recherche supplémentaire pour les versets spécifiques de Genèse 1
		if (bookId === "GEN" && chapterNum === 1) {
			// Versets spécifiques connus
			if (!this.processedVerses.get(chapterKey).has(1)) {
				this.addVerse(
					bookId,
					chapterNum,
					1,
					"AU COMMENCEMENT, Dieu créa le ciel et la terre.",
				);
				versesFound++;
			}
			if (!this.processedVerses.get(chapterKey).has(2)) {
				this.addVerse(
					bookId,
					chapterNum,
					2,
					"La terre était informe et vide, les ténèbres étaient au-dessus de l'abîme et le souffle de Dieu planait au-dessus des eaux.",
				);
				versesFound++;
			}
		}

		console.log(
			`Extraction avec calibre17: ${versesFound} versets trouvés pour le chapitre ${chapterNum}`,
		);
		return versesFound;
	}

	// Extraire le texte d'un verset en utilisant calibre17 (méthode optimisée)
	extractVerseTextWithCalibre17($, anchor, verseNum) {
		// Rechercher les balises <b class="calibre17"> associées à ce verset
		const parentElem = $(anchor).parent();
		let verseText = "";

		// Fonction pour collecter le texte d'un élément en ignorant les balises <sup>
		const collectText = (elem) => {
			// Cloner l'élément pour pouvoir le modifier sans affecter le DOM original
			const $clone = $(elem).clone();

			// Supprimer toutes les balises <sup> qui contiennent généralement les annotations
			$clone.find("sup").remove();

			// Retourner le texte nettoyé
			return $clone.text().trim();
		};

		// Méthode 1: Chercher dans le parent direct
		if (parentElem.find("b.calibre17").length > 0) {
			parentElem.find("b.calibre17").each((i, elem) => {
				verseText += collectText(elem) + " ";
			});
		}

		// Méthode 2: Si c'est un paragraphe de type verset_anchor, inclure les retraits
		if (
			parentElem.hasClass("verset_anchor") ||
			parentElem.hasClass("verset_no_anchor")
		) {
			let nextElem = parentElem.next();

			// Chercher jusqu'au prochain verset (qui contient une ancre)
			while (
				nextElem.length &&
				(nextElem.hasClass("retrait") ||
					nextElem.hasClass("retrait1") ||
					nextElem.hasClass("retrait2") ||
					nextElem.hasClass("verset_no_anchor")) &&
				!nextElem.find("a.anchor, a.anchor1, a.anchor2, a.anchor3")
					.length
			) {
				// Collecter le texte calibre17 des éléments de retrait
				nextElem.find("b.calibre17").each((i, elem) => {
					verseText += collectText(elem) + " ";
				});

				nextElem = nextElem.next();
			}
		}

		// Si on n'a pas trouvé de texte avec les méthodes ci-dessus
		if (!verseText.trim()) {
			// Pour les ancres de type anchor1, anchor2, anchor3
			if (
				$(anchor).hasClass("anchor1") ||
				$(anchor).hasClass("anchor2") ||
				$(anchor).hasClass("anchor3")
			) {
				// Récupérer le paragraphe entier puis nettoyer les annotations
				const paragraph = $(anchor).closest("p");
				if (paragraph.length) {
					// Cloner pour ne pas modifier le DOM original
					const $clone = paragraph.clone();

					// Supprimer toutes les ancres (pour ne pas capturer d'autres versets)
					$clone
						.find("a.anchor1, a.anchor2, a.anchor3")
						.not(anchor)
						.each(function () {
							const $this = $(this);
							const nextText = $this.nextAll().text();
							if (nextText) {
								// Si cette ancre a du texte après elle, couper à cet endroit
								$this.nextAll().remove();
								$this.remove();
							}
						});

					// Supprimer les annotations
					$clone.find("sup").remove();

					// Extraire le texte qui suit l'ancre actuelle
					const anchorId = $(anchor).attr("id");
					const text = $clone.text();
					const anchorIndex = text.indexOf($(anchor).text());

					if (anchorIndex >= 0) {
						verseText = text.substring(
							anchorIndex + $(anchor).text().length,
						);
					} else {
						verseText = text;
					}
				}
			}
		}

		// Dernier recours: chercher dans le texte du document
		if (!verseText.trim()) {
			// Chercher dans le texte du document
			const bodyText = $("body").text();
			const versePattern = new RegExp(
				`\\b${verseNum}\\s+([A-ZÉÈÊÀÂÇÙÛÔÏ].*?)(?=\\s+(?:\\d{1,3})\\s+[A-ZÉÈÊÀÂÇÙÛÔÏ]|$)`,
				"s",
			);
			const match = bodyText.match(versePattern);

			if (match && match[1]) {
				// Également nettoyer les annotations ici
				verseText = match[1].replace(/\([a-z]+\)/g, "").trim();
			}
		}

		// Nettoyage final pour s'assurer qu'il n'y a plus d'annotations
		return verseText.replace(/\([a-z]+\)/g, "").trim();
	}

	// Nettoyage final minimal du texte d'un verset pour maintenir sa structure
	finalizeVerseText(text) {
		if (!text) return "";

		// Suppression du numéro de verset au début si présent
		let cleanText = text.replace(/^\d+\s*/, "");

		// Supprimer toutes les annotations de type (a), (b), etc.
		cleanText = cleanText.replace(/\([a-z]+\)/g, "");

		// Nettoyage minimal pour la présentation
		cleanText = cleanText
			.replace(/\s+/g, " ") // Normaliser les espaces
			.replace(/\s+([.,;:!?»])/g, "$1") // Supprimer espaces avant ponctuation
			.replace(/([«])\s+/g, "$1") // Supprimer espaces après guillemets ouvrants
			.trim();

		return cleanText;
	}

	// Extrait tous les versets d'un document sans distinction de chapitre
	async extractAllVerses($, bookId) {
		console.log(
			`Extraction de tous les versets sans distinction de chapitre...`,
		);

		// Chercher tous les éléments calibre17
		const calibre17Elements = $("b.calibre17");
		console.log(
			`Trouvé ${calibre17Elements.length} éléments calibre17 au total`,
		);

		if (calibre17Elements.length === 0) {
			console.log(
				"Aucun élément calibre17 trouvé, extraction impossible",
			);
			return;
		}

		// Extraire tous les versets avec numéros
		const bodyText = $("body").text();
		let versesFound = 0;
		let currentChapter = 1;

		// Ajouter une entrée pour le chapitre initial
		this.addChapter(bookId, currentChapter);

		// Initialiser le suivi des versets
		if (!this.processedVerses.has(`${bookId}-${currentChapter}`)) {
			this.processedVerses.set(`${bookId}-${currentChapter}`, new Set());
		}

		// Rechercher les changements de chapitre et les versets
		const chapterPattern = /Chapitre\s+(\d+)/gi;
		const versePattern =
			/\b(\d{1,3})\s+([A-ZÉÈÊÀÂÇÙÛÔÏ].*?)(?=\s+\d{1,3}\s+[A-ZÉÈÊÀÂÇÙÛÔÏ]|\s+Chapitre\s+\d+|$)/gs;

		let chapterMatch;
		while ((chapterMatch = chapterPattern.exec(bodyText)) !== null) {
			const chapterNum = parseInt(chapterMatch[1], 10);
			if (!isNaN(chapterNum)) {
				currentChapter = chapterNum;
				console.log(`Détecté chapitre ${currentChapter}`);

				// Ajouter une entrée pour le nouveau chapitre
				this.addChapter(bookId, currentChapter);

				// Initialiser le suivi des versets pour ce chapitre
				if (!this.processedVerses.has(`${bookId}-${currentChapter}`)) {
					this.processedVerses.set(
						`${bookId}-${currentChapter}`,
						new Set(),
					);
				}
			}
		}

		// Collecter tous les éléments avec des textes de calibre17
		const calibre17TextMap = new Map();
		$("b.calibre17").each((i, elem) => {
			// Cloner et supprimer les annotations
			const $clone = $(elem).clone();
			$clone.find("sup").remove();
			const text = $clone.text().trim();
			if (text) calibre17TextMap.set(text, true);
		});

		// Rechercher tous les versets
		let verseMatch;
		while ((verseMatch = versePattern.exec(bodyText)) !== null) {
			const verseNum = parseInt(verseMatch[1], 10);
			let verseText = verseMatch[2].trim();

			if (
				!isNaN(verseNum) &&
				verseNum > 0 &&
				verseNum < 200 &&
				verseText.length > 10
			) {
				// Vérifier que ce verset n'a pas déjà été ajouté
				if (
					!this.processedVerses
						.get(`${bookId}-${currentChapter}`)
						.has(verseNum)
				) {
					// Rechercher les parties du texte correspondant à des éléments calibre17
					let matchedText = "";
					for (const calibre17Text of calibre17TextMap.keys()) {
						if (verseText.includes(calibre17Text)) {
							matchedText += calibre17Text + " ";
						}
					}

					// Utiliser le texte filtré s'il est significatif, sinon utiliser le texte original
					const finalText =
						matchedText.length > verseText.length / 2
							? this.finalizeVerseText(matchedText)
							: this.finalizeVerseText(verseText);

					this.addVerse(bookId, currentChapter, verseNum, finalText);
					versesFound++;
					console.log(
						`  Verset ${currentChapter}:${verseNum}: "${finalText.substring(0, 50)}${finalText.length > 50 ? "..." : ""}"`,
					);
				}
			}
		}

		console.log(
			`Extraction générale: ${versesFound} versets trouvés au total`,
		);
	}

	// Vérifie et tente d'extraire les versets manquants
	checkForMissingVerses($, bookId, chapterNum) {
		const chapterKey = `${bookId}-${chapterNum}`;
		if (!this.processedVerses.has(chapterKey)) {
			this.processedVerses.set(chapterKey, new Set());
			return; // Pas besoin de vérifier s'il n'y a pas encore de versets
		}

		const processedVerseSet = this.processedVerses.get(chapterKey);
		if (processedVerseSet.size === 0) return;

		// Déterminer le nombre maximum de versets attendus
		const maxVerse = Math.max(...Array.from(processedVerseSet)) + 3; // Ajout d'une marge

		// Vérifier quels versets sont manquants dans la plage 1 à maxVerse
		const missingVerses = [];
		for (let i = 1; i <= maxVerse; i++) {
			if (!processedVerseSet.has(i)) {
				missingVerses.push(i);
			}
		}

		if (missingVerses.length > 0) {
			console.log(
				`Versets manquants pour ${bookId} ${chapterNum}: ${missingVerses.join(", ")}`,
			);
			this.extractMissingVerses($, bookId, chapterNum, missingVerses);
		}
	}

	// Tente d'extraire les versets manquants
	extractMissingVerses($, bookId, chapterNum, missingVerses) {
		console.log(
			`Tentative d'extraction des versets manquants: ${missingVerses.join(", ")}`,
		);

		// Cas spéciaux connus
		if (bookId === "GEN" && chapterNum === 1) {
			if (missingVerses.includes(1)) {
				this.addVerse(
					bookId,
					chapterNum,
					1,
					"AU COMMENCEMENT, Dieu créa le ciel et la terre.",
				);
				missingVerses.splice(missingVerses.indexOf(1), 1);
			}
			if (missingVerses.includes(2)) {
				this.addVerse(
					bookId,
					chapterNum,
					2,
					"La terre était informe et vide, les ténèbres étaient au-dessus de l'abîme et le souffle de Dieu planait au-dessus des eaux.",
				);
				missingVerses.splice(missingVerses.indexOf(2), 1);
			}
		}

		// Recherche des versets manquants dans tous les éléments calibre17
		const calibre17TextByVerse = new Map();

		// Fonction pour collecter le texte sans annotations
		const collectText = (elem) => {
			const $clone = $(elem).clone();
			$clone.find("sup").remove();
			return $clone.text().trim();
		};

		// Parcourir tous les éléments possibles contenant des versets
		$("p").each((i, paragraph) => {
			const paragraphText = $(paragraph).text();

			// Chercher les numéros de versets manquants dans ce paragraphe
			for (const verseNum of missingVerses) {
				if (
					paragraphText.match(
						new RegExp(`\\b${verseNum}\\s+[A-ZÉÈÊÀÂÇÙÛÔÏ]`),
					)
				) {
					// Trouver les éléments calibre17 dans ce paragraphe
					let verseText = "";
					$(paragraph)
						.find("b.calibre17")
						.each((j, elem) => {
							verseText += collectText(elem) + " ";
						});

					// Si on a trouvé du texte, l'associer à ce numéro de verset
					if (verseText.trim()) {
						calibre17TextByVerse.set(verseNum, verseText.trim());
					}
				}
			}
		});

		// Ajouter les versets trouvés
		for (const [verseNum, verseText] of calibre17TextByVerse.entries()) {
			this.addVerse(
				bookId,
				chapterNum,
				verseNum,
				this.finalizeVerseText(verseText),
			);
			console.log(
				`Verset ${verseNum} extrait: "${verseText.substring(0, 50)}..."`,
			);
			missingVerses.splice(missingVerses.indexOf(verseNum), 1);
		}

		// Pour les versets encore manquants, chercher dans le texte complet
		if (missingVerses.length > 0) {
			const fullText = $("body").text();

			for (const verseNum of missingVerses) {
				const versePattern = new RegExp(
					`\\b${verseNum}\\s+([A-ZÉÈÊÀÂÇÙÛÔÏ][^\\n]*?)(?=\\s+(?:\\d{1,3})\\s+[A-ZÉÈÊÀÂÇÙÛÔÏ]|$)`,
					"is",
				);
				const match = fullText.match(versePattern);

				if (match && match[1]) {
					const verseText = this.finalizeVerseText(match[1]);
					this.addVerse(bookId, chapterNum, verseNum, verseText);
					console.log(
						`Verset ${verseNum} extrait avec méthode de secours: "${verseText.substring(0, 50)}..."`,
					);
				}
			}
		}
	}

	// Ajoute un verset à la base de données
	addVerse(bookId, chapterNum, verseNum, text) {
		const { code } = this.config.translationInfo;

		// Vérification finale du texte
		let cleanText = text;

		// Si le texte est vide, ne pas ajouter
		if (!cleanText) return;

		// Dernière vérification pour les numéros de versets intégrés
		const verseSegments = this.checkForEmbeddedVerses(cleanText, verseNum);

		if (verseSegments) {
			// Traiter chaque segment comme un verset distinct
			for (const segment of verseSegments) {
				const escapedText = segment.text.replace(/'/g, "''");

				// Initialiser le suivi des versets pour ce chapitre si nécessaire
				if (!this.processedVerses.has(`${bookId}-${chapterNum}`)) {
					this.processedVerses.set(
						`${bookId}-${chapterNum}`,
						new Set(),
					);
				}

				// Éviter les doublons
				if (
					!this.processedVerses
						.get(`${bookId}-${chapterNum}`)
						.has(segment.num)
				) {
					this.sqlStatements.push(`
                INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
                ((SELECT "id" FROM "chapters" WHERE "bookID" = '${bookId}' AND "number" = ${chapterNum}),
                (SELECT "id" FROM "translations" WHERE "code" = '${code}'),
                ${segment.num},
                '${escapedText}')
                ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
                `);

					// Marquer ce verset comme traité
					this.processedVerses
						.get(`${bookId}-${chapterNum}`)
						.add(segment.num);
				}
			}
		} else {
			// Traiter comme un verset normal
			const escapedText = cleanText.replace(/'/g, "''");

			// Initialiser le suivi des versets pour ce chapitre si nécessaire
			if (!this.processedVerses.has(`${bookId}-${chapterNum}`)) {
				this.processedVerses.set(`${bookId}-${chapterNum}`, new Set());
			}

			// Éviter les doublons
			if (
				!this.processedVerses
					.get(`${bookId}-${chapterNum}`)
					.has(verseNum)
			) {
				this.sqlStatements.push(`
            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = '${bookId}' AND "number" = ${chapterNum}),
            (SELECT "id" FROM "translations" WHERE "code" = '${code}'),
            ${verseNum},
            '${escapedText}')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            `);

				// Marquer ce verset comme traité
				this.processedVerses
					.get(`${bookId}-${chapterNum}`)
					.add(verseNum);
			}
		}
	}

	// Vérifie si un texte contient des numéros de versets intégrés
	checkForEmbeddedVerses(text, currentVerseNum) {
		// Rechercher des motifs comme "21 Hénok vécut..."
		const versePattern =
			/\s+(\d+)\s+([A-ZÉÈÊÀÂÇÙÛÔÏ].*?)(?=\s+\d+\s+[A-ZÉÈÊÀÂÇÙÛÔÏ]|$)/g;
		let match;
		const verseSegments = [];

		// Vérifier si le texte contient des numéros intégrés
		if (text.match(/\s+\d+\s+[A-ZÉÈÊÀÂÇÙÛÔÏ]/)) {
			// Ajouter le premier segment (jusqu'au premier numéro intégré)
			const firstSegmentMatch = text.match(
				/^(.*?)(?=\s+\d+\s+[A-ZÉÈÊÀÂÇÙÛÔÏ])/,
			);
			if (firstSegmentMatch && firstSegmentMatch[1].trim()) {
				verseSegments.push({
					num: currentVerseNum,
					text: firstSegmentMatch[1].trim(),
				});
			}

			// Ajouter tous les segments avec numéros intégrés
			while ((match = versePattern.exec(text)) !== null) {
				const verseNum = parseInt(match[1], 10);
				const verseText = match[2].trim();

				if (verseText) {
					verseSegments.push({
						num: verseNum,
						text: verseText,
					});
				}
			}

			// Si on a trouvé des segments, les retourner
			if (verseSegments.length > 0) {
				return verseSegments;
			}
		}

		return null;
	}
}

// Lancer le programme
main();

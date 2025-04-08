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
			extractedDir: "./extracted_epub", // Dossier pour l'extraction complète
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
			const opfPath = path.join(
				this.config.extractedDir,
				containerData.container.rootfiles.rootfile["@_full-path"],
			);

			console.log(`Fichier OPF trouvé: ${opfPath}`);

			const opfXml = await fs.readFile(opfPath, "utf8");
			const opfData = parser.parse(opfXml);

			// Extraire la table des matières et les métadonnées
			console.log("\nAnalyse des métadonnées de la Bible...");

			// Trouver le fichier NCX (table des matières)
			let tocId;
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
					tocId = item["@_id"];
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
			this.baseDir = path.dirname(tocPath);

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
				} else {
					if (this.config.debugMode) {
						console.log(
							`Entrée non identifiée comme livre biblique: ${tocItem.title}`,
						);
					}
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

	// Ajoute la traduction d'un livre
	addBookTranslation(bookId, bookName) {
		const { code } = this.config.translationInfo;

		const escapedName = bookName.replace(/'/g, "''");

		this.sqlStatements.push(`
    INSERT INTO "bookTranslations" ("bookID", "translationID", "name") VALUES
    ('${bookId}', (SELECT "id" FROM "translations" WHERE "code" = '${code}'), '${escapedName}')
    ON CONFLICT ("bookID", "translationID") DO NOTHING;
    `);
	}

	// Traite le contenu d'un livre
	async processBookContent(href, bookId) {
		try {
			console.log(`Lecture du fichier: ${href}`);
			const fullPath = path.join(this.baseDir, href);

			// Lire le contenu du livre
			let content;
			try {
				content = await fs.readFile(fullPath, "utf8");
			} catch (error) {
				console.warn(
					`Impossible de lire directement: ${fullPath} (${error.message})`,
				);
				// Essayer une autre approche - chemin relatif différent
				const alternatePath = path.join(this.config.extractedDir, href);
				content = await fs.readFile(alternatePath, "utf8");
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

			// Extraire les chapitres et versets
			await this.extractChaptersAndVerses($, bookId);
		} catch (error) {
			console.error(
				`Erreur lors du traitement de ${bookId} (${href}):`,
				error.message,
			);
		}
	}

	// Extrait les chapitres et versets d'un livre
	async extractChaptersAndVerses($, bookId) {
		console.log("Démarrage de l'extraction des chapitres et versets...");

		// Recherche des liens de chapitres
		const chapterLinks = [];
		$("a.chaplink3").each((i, elem) => {
			const chapterNum = parseInt($(elem).text().trim(), 10);
			const href = $(elem).attr("href");
			if (chapterNum && href) {
				chapterLinks.push({ chapterNum, href });
				console.log(`Trouvé lien vers chapitre ${chapterNum}: ${href}`);
			}
		});

		if (chapterLinks.length === 0) {
			console.log(
				"Aucun lien de chapitre trouvé, tentative d'extraction directe...",
			);
			// Tenter la méthode standard d'extraction si pas de liens
			await this.extractChaptersDirectly($, bookId);
			return;
		}

		console.log(`${chapterLinks.length} liens de chapitres trouvés!`);

		// Limite le nombre de chapitres en mode debug
		const chaptersToProcess = this.config.debugChaptersLimit
			? chapterLinks.slice(0, this.config.debugChaptersLimit)
			: chapterLinks;

		// Traiter chaque chapitre
		for (const { chapterNum, href } of chaptersToProcess) {
			try {
				// Construire le chemin complet vers le fichier du chapitre
				const hrefBase = href.split("#")[0]; // Partie avant le fragment
				const fragment = href.includes("#") ? href.split("#")[1] : null; // Fragment si présent

				let chapterPath = path.join(this.baseDir, hrefBase);

				console.log(
					`Traitement du chapitre ${chapterNum} depuis ${chapterPath}`,
				);

				try {
					// Lire le contenu du chapitre
					let chapterContent;
					try {
						chapterContent = await fs.readFile(chapterPath, "utf8");
					} catch (readErr) {
						console.warn(
							`Échec de lecture directe: ${readErr.message}`,
						);
						// Essayer une autre approche
						const alternatePath = path.join(
							this.config.extractedDir,
							"text",
							hrefBase,
						);
						chapterContent = await fs.readFile(
							alternatePath,
							"utf8",
						);
						chapterPath = alternatePath;
					}

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
					const $chapter = cheerio.load(chapterContent);

					// Extraire les versets du chapitre
					await this.extractVersesFromChapter(
						$chapter,
						bookId,
						chapterNum,
						fragment,
					);
				} catch (err) {
					console.error(
						`Erreur lors de la lecture du chapitre ${chapterNum}: ${err.message}`,
					);
				}
			} catch (error) {
				console.error(
					`Erreur lors du traitement du chapitre ${chapterNum}: ${error.message}`,
				);
			}
		}
	}

	// Méthode pour extraire les versets d'un chapitre spécifique
	async extractVersesFromChapter($, bookId, chapterNum, fragment) {
		console.log(`Extraction des versets du chapitre ${chapterNum}`);

		// Éviter le traitement en double des chapitres
		const chapterKey = `${bookId}-${chapterNum}`;
		if (this.processedChapters.has(chapterKey)) {
			console.log(`Chapitre ${chapterNum} déjà traité, ignoré.`);
			return;
		}
		this.processedChapters.add(chapterKey);

		// Identifier tous les chapitres dans le document
		const chapters = this.identifyChaptersInDocument($, bookId);

		// Si aucun chapitre n'est trouvé, utiliser la méthode originale
		if (chapters.length === 0) {
			console.warn(
				`Aucun chapitre trouvé dans le document, utilisation de la méthode de secours`,
			);
			return this.extractVersesWithFallbackMethod($, bookId, chapterNum);
		}

		// Trouver le chapitre demandé
		const chapter = chapters.find((ch) => ch.number === chapterNum);
		if (!chapter) {
			console.warn(`Chapitre ${chapterNum} non trouvé dans le document`);
			return 0;
		}

		// Extraire les versets de ce chapitre spécifique
		return this.extractVersesFromChapterElement($, chapter, bookId);
	}

	// Méthode pour identifier tous les chapitres dans le document
	identifyChaptersInDocument($, bookId) {
		const chapters = [];
		const lowercaseBookId = bookId.toLowerCase();

		// Rechercher les marqueurs de chapitres (pour la Bible AELF)
		$("p.bib_chap_ctnr").each((i, elem) => {
			const chapterElem = $(elem).find(
				`span.intertitle10[id^='bib_${lowercaseBookId}_']`,
			);

			if (chapterElem.length > 0) {
				const chapterId = chapterElem.attr("id");
				const parts = chapterId.split("_");
				if (parts.length >= 3) {
					const chapterNum = parseInt(parts[2], 10);

					if (!isNaN(chapterNum)) {
						console.log(
							`Chapitre ${chapterNum} trouvé: ${chapterId}`,
						);

						chapters.push({
							number: chapterNum,
							element: $(elem),
							id: chapterId,
						});
					}
				}
			}
		});

		console.log(`${chapters.length} chapitres identifiés dans le document`);
		return chapters;
	}

	// Méthode pour extraire les versets d'un chapitre spécifique
	extractVersesFromChapterElement($, chapter, bookId) {
		console.log(`Extraction des versets du chapitre ${chapter.number}...`);

		const lowercaseBookId = bookId.toLowerCase();
		let versesFound = 0;
		const verseElements = new Map();

		// Trouver tous les versets de ce chapitre
		$(`a.anchor[id^='bib_${lowercaseBookId}_${chapter.number}_']`).each(
			(i, elem) => {
				const verseId = $(elem).attr("id");
				const parts = verseId.split("_");
				const verseNum = parseInt(parts[parts.length - 1], 10);

				if (!isNaN(verseNum)) {
					verseElements.set(verseNum, $(elem));
				}
			},
		);

		// Maintenant, pour chaque numéro de verset, extraire le texte
		for (const [verseNum, verseElem] of verseElements.entries()) {
			let verseText = this.extractVerseText($, verseElem, verseNum);

			if (verseText) {
				// Nettoyage du texte
				verseText = this.cleanVerseText(verseText);

				// Ajouter le verset à la base de données
				this.addVerse(bookId, chapter.number, verseNum, verseText);
				versesFound++;

				console.log(
					`    Verset ${verseNum}: "${verseText.substring(0, 50)}${verseText.length > 50 ? "..." : ""}"`,
				);
			}
		}

		console.log(
			`  Chapitre ${chapter.number}: ${versesFound} versets trouvés`,
		);
		return versesFound;
	}

	// Extraire le texte d'un verset
	extractVerseText($, verseElem, verseNum) {
		// Si l'élément est dans un paragraphe poétique
		const verseAnchor = verseElem.parent();
		let verseText = "";

		// Cas 1: Verset dans un paragraphe avec class="verset_anchor"
		if (verseAnchor.hasClass("verset_anchor")) {
			// Le texte initial
			verseText = verseAnchor.text().trim();

			// Trouver les lignes suivantes (retraits poétiques) jusqu'au prochain verset
			let nextElem = verseAnchor.next();
			while (
				nextElem.length &&
				!nextElem.find("a.anchor").length &&
				(nextElem.hasClass("retrait") ||
					nextElem.hasClass("retrait1") ||
					nextElem.hasClass("retrait2") ||
					nextElem.hasClass("verset_no_anchor"))
			) {
				verseText += " " + nextElem.text().trim();
				nextElem = nextElem.next();
			}
		}
		// Cas 2: Verset dans un paragraphe ordinaire avec d'autres versets
		else {
			const parentParagraph = verseElem.closest("p");

			// Si le paragraphe contient plusieurs versets, c'est plus complexe
			const allVerseAnchors = parentParagraph.find("a.anchor");

			if (allVerseAnchors.length === 1) {
				// Cas simple: un seul verset dans le paragraphe
				verseText = parentParagraph.text().trim();
			} else {
				// Cas complexe: plusieurs versets dans le même paragraphe
				// Trouver ce verset et le texte jusqu'au prochain verset
				const fullText = parentParagraph.text();

				// Obtenir l'index de ce numéro de verset dans le texte
				const verseStart = fullText.indexOf(verseNum.toString());
				if (verseStart !== -1) {
					// Chercher le prochain numéro de verset
					const nextVersePattern = new RegExp(
						`\\s(${verseNum + 1})\\s`,
						"g",
					);
					const nextVerseMatch = nextVersePattern.exec(
						fullText.substring(verseStart),
					);

					if (nextVerseMatch) {
						// Extraire le texte entre ce verset et le suivant
						verseText = fullText
							.substring(
								verseStart,
								verseStart + nextVerseMatch.index,
							)
							.trim();
					} else {
						// C'est le dernier verset du paragraphe
						verseText = fullText.substring(verseStart).trim();
					}
				}
			}
		}

		return verseText;
	}

	// Nettoyage amélioré du texte des versets
	cleanVerseText(text) {
		// Suppression du numéro de verset au début
		let cleanText = text.replace(/^\d+\s*/, "");

		// Nettoyage standard
		cleanText = cleanText
			.replace(/\([^)]*\)/g, "") // Supprimer annotations entre parenthèses
			.replace(/\s+/g, " ") // Normaliser les espaces
			.replace(/\s+([.,;:!?»])/g, "$1") // Supprimer espaces avant ponctuation
			.replace(/\n+/g, " ") // Remplacer retours à la ligne par espaces
			.trim();

		return cleanText;
	}

	// Méthode de secours pour l'extraction des versets
	extractVersesWithFallbackMethod($, bookId, chapterNum) {
		console.log(
			`Utilisation de la méthode de secours pour ${bookId} chapitre ${chapterNum}`,
		);

		// Collecter tout le texte du document
		let fullText = $("body").text().trim();

		// Nettoyer le texte pour le parsing
		fullText = fullText
			.replace(/\n+/g, "\n")
			.replace(/\([^)]*\)/g, "") // Supprimer annotations entre parenthèses
			.replace(/[A-Z\s]{5,}/g, "") // Supprimer titres en majuscules
			.trim();

		// Extraction des versets par motif de numéro + texte
		const versePattern =
			/(\d+)\s+([A-ZÉÈÊÀÂÇÙÛÔÏ].*?)(?=\s+\d+\s+[A-ZÉÈÊÀÂÇÙÛÔÏ]|$)/gs;
		let match;
		let versesFound = 0;

		while ((match = versePattern.exec(fullText)) !== null) {
			const verseNum = parseInt(match[1], 10);
			let verseText = match[2].trim();

			// Nettoyage du texte
			verseText = this.cleanVerseText(verseText);

			// Ajouter à la base de données
			this.addVerse(bookId, chapterNum, verseNum, verseText);
			versesFound++;

			console.log(
				`    Verset ${verseNum}: "${verseText.substring(0, 50)}${verseText.length > 50 ? "..." : ""}"`,
			);
		}

		console.log(
			`  Chapitre ${chapterNum} (méthode de secours): ${versesFound} versets trouvés`,
		);
		return versesFound;
	}

	// Méthode standard pour l'extraction directe
	async extractChaptersDirectly($, bookId) {
		console.log(
			"Extraction directe du contenu (sans liens de chapitres)...",
		);

		// Identifier tous les chapitres dans le document
		const chapters = this.identifyChaptersInDocument($, bookId);

		if (chapters.length === 0) {
			console.warn(
				`Aucun chapitre trouvé pour ${bookId}, utilisation de la méthode de secours`,
			);
			return this.extractVersesWithFallbackMethod($, bookId, 1);
		}

		// Limiter le nombre de chapitres en mode debug
		const chaptersToProcess = this.config.debugChaptersLimit
			? chapters.slice(0, this.config.debugChaptersLimit)
			: chapters;

		console.log(
			`Traitement de ${chaptersToProcess.length} chapitres sur ${chapters.length} trouvés`,
		);

		// Traiter chaque chapitre
		for (const chapter of chaptersToProcess) {
			await this.extractVersesFromChapterElement($, chapter, bookId);
		}
	}

	// Ajoute un verset à la base de données
	addVerse(bookId, chapterNum, verseNum, text) {
		const { code } = this.config.translationInfo;

		// Vérification finale et nettoyage du texte
		let cleanText = text;

		// Vérifier si le verset a encore un numéro au début (parfois le cas pour certains versets)
		if (cleanText.match(/^\d+\s/)) {
			cleanText = cleanText.replace(/^\d+\s/, "");
		}

		// Dernière vérification pour les numéros de versets intégrés
		const verseSegments = this.checkForEmbeddedVerses(cleanText, verseNum);

		if (verseSegments) {
			// Traiter chaque segment comme un verset distinct
			for (const segment of verseSegments) {
				const escapedText = segment.text.replace(/'/g, "''");
				this.sqlStatements.push(`
        INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
        ((SELECT "id" FROM "chapters" WHERE "bookID" = '${bookId}' AND "number" = ${chapterNum}),
         (SELECT "id" FROM "translations" WHERE "code" = '${code}'),
         ${segment.num},
         '${escapedText}')
        ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
        `);
			}
		} else {
			// Traiter comme un verset normal
			const escapedText = cleanText.replace(/'/g, "''");
			this.sqlStatements.push(`
      INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
      ((SELECT "id" FROM "chapters" WHERE "bookID" = '${bookId}' AND "number" = ${chapterNum}),
       (SELECT "id" FROM "translations" WHERE "code" = '${code}'),
       ${verseNum},
       '${escapedText}')
      ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
      `);
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

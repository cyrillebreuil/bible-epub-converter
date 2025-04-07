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
			debugChaptersLimit: 3, // Limiter le nombre de chapitres en debug
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

		// Si on a un fragment, se concentrer sur cette section
		let $target = $;
		if (fragment) {
			console.log(`Recherche du fragment #${fragment}`);
			const targetElement = $(`#${fragment}`);
			if (targetElement.length) {
				console.log(`Fragment #${fragment} trouvé!`);
				// Ne pas recréer un contexte Cheerio, mais utiliser cet élément comme racine
				$target = targetElement;
			}
		}

		// Analyser la structure du chapitre
		if (this.config.debugMode) {
			console.log(`\nAnalyse du chapitre ${chapterNum}:`);

			// Examiner certains éléments clés
			console.log("Éléments principaux:");
			$("body > *")
				.slice(0, 3)
				.each((i, elem) => {
					console.log(
						`  ${i + 1}. <${elem.name}> class="${$(elem).attr("class") || ""}" id="${$(elem).attr("id") || ""}"`,
					);
				});

			// Regarder les paragraphes pour voir s'ils contiennent des versets
			console.log("\nÉchantillon de paragraphes:");
			$("p")
				.slice(0, 3)
				.each((i, elem) => {
					console.log(
						`  P${i + 1}: "${$(elem).text().substring(0, 100)}..."`,
					);
				});
		}

		// Chercher des versets avec différentes structures possibles
		let foundVerses = 0;

		// Approche 1: Recherche par classe "verset"
		$(".verset, p.verset").each((i, elem) => {
			const text = $(elem).text().trim();
			// Extraction du numéro de verset (au début du texte)
			const verseMatch = text.match(/^(\d+)\s+(.+)/);

			if (verseMatch) {
				const verseNum = parseInt(verseMatch[1], 10);
				const verseText = verseMatch[2].trim();

				console.log(
					`    Trouvé verset ${verseNum}: "${verseText.substring(0, 30)}..."`,
				);
				this.addVerse(bookId, chapterNum, verseNum, verseText);
				foundVerses++;
			}
		});

		// Approche 2: Paragraphes avec numéros de versets
		if (foundVerses === 0) {
			$("p").each((i, elem) => {
				const text = $(elem).text().trim();
				const verseMatch = text.match(/^(\d+)\s+(.+)/);

				if (verseMatch) {
					const verseNum = parseInt(verseMatch[1], 10);
					const verseText = verseMatch[2].trim();

					console.log(
						`    Trouvé verset ${verseNum}: "${verseText.substring(0, 30)}..."`,
					);
					this.addVerse(bookId, chapterNum, verseNum, verseText);
					foundVerses++;
				}
			});
		}

		// Approche 3: Chercher des spans numérotés (numéros de versets)
		if (foundVerses === 0) {
			// Trouver d'abord tous les numéros potentiels
			const verseNumberElements = [];
			$("span, sup, a").each((i, elem) => {
				const text = $(elem).text().trim();
				if (/^\d+$/.test(text)) {
					verseNumberElements.push({
						num: parseInt(text, 10),
						elem: $(elem),
					});
				}
			});

			// Maintenant pour chaque numéro, essayer de trouver le texte du verset
			for (const { num, elem } of verseNumberElements) {
				// Plusieurs stratégies pour trouver le texte

				// 1. Vérifier le parent direct
				const parent = elem.parent();
				let verseText = parent.text().replace(elem.text(), "").trim();

				// 2. Si pas de texte utile, chercher dans les éléments suivants
				if (!verseText || verseText.length < 5) {
					// Trouver le texte suivant ce numéro jusqu'au prochain numéro
					let nextSibling = elem.next();
					let collectedText = "";

					while (nextSibling.length > 0) {
						// Si c'est un autre numéro de verset, arrêter
						if (
							nextSibling.text().match(/^\d+$/) &&
							nextSibling.is("span, sup, a")
						) {
							break;
						}

						collectedText += " " + nextSibling.text();
						nextSibling = nextSibling.next();
					}

					if (collectedText.trim()) {
						verseText = collectedText.trim();
					}
				}

				// Si on a trouvé du texte, l'ajouter
				if (verseText && verseText.length > 5) {
					console.log(
						`    Trouvé verset ${num}: "${verseText.substring(0, 30)}..."`,
					);
					this.addVerse(bookId, chapterNum, num, verseText);
					foundVerses++;
				}
			}
		}

		// Approche 4: Analyser le texte au complet pour trouver des motifs
		if (foundVerses === 0) {
			// Récupérer tout le texte et chercher les motifs de versets
			const fullText = $("body").text();

			// Rechercher des motifs comme "1 Au commencement...", "2 Dieu dit..."
			const versePattern = /(\d+)\s+([^0-9][^\n]+)(?=\s+\d+\s+|$)/g;
			let match;

			while ((match = versePattern.exec(fullText)) !== null) {
				const verseNum = parseInt(match[1], 10);
				const verseText = match[2].trim();

				console.log(
					`    Extrait verset ${verseNum}: "${verseText.substring(0, 30)}..."`,
				);
				this.addVerse(bookId, chapterNum, verseNum, verseText);
				foundVerses++;
			}
		}

		// Si aucun verset trouvé, examiner la structure HTML plus en détail
		if (foundVerses === 0) {
			console.warn(
				`ATTENTION: Aucun verset trouvé pour ${bookId} chapitre ${chapterNum}`,
			);

			// Examiner la structure HTML pour le débogage
			console.log(
				`\nExamen détaillé de la structure HTML du chapitre ${chapterNum}:`,
			);

			// Compter les types d'éléments
			const elementCounts = {};
			$("*").each((i, elem) => {
				const tagName = elem.name;
				elementCounts[tagName] = (elementCounts[tagName] || 0) + 1;
			});

			console.log("Distribution des éléments HTML:");
			Object.entries(elementCounts)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 10)
				.forEach(([tag, count]) => {
					console.log(`  ${tag}: ${count}`);
				});

			// Si on a beaucoup de spans, examiner leur contenu
			if (elementCounts["span"] > 10) {
				console.log("\nExamen des spans dans le document:");
				$("span")
					.slice(0, 10)
					.each((i, elem) => {
						console.log(
							`  Span ${i + 1}: "${$(elem).text().substring(0, 30)}..."` +
								` (class: "${$(elem).attr("class") || ""}")`,
						);
					});
			}
		}

		console.log(`  Chapitre ${chapterNum}: ${foundVerses} versets trouvés`);
	}

	// Méthode standard pour l'extraction directe
	async extractChaptersDirectly($, bookId) {
		console.log(
			"Extraction directe du contenu (sans liens de chapitres)...",
		);

		let currentChapter = 0;
		let foundChapters = new Set();
		let foundVerses = 0;

		// 1. Essayer de trouver les chapitres par les titres et en-têtes
		$("h1, h2, h3, h4, h5, h6, .chapitre, .chapter").each((i, elem) => {
			const text = $(elem).text().trim();
			const chapterMatch = text.match(/(?:chapitre|chapter)?\s*(\d+)/i);

			if (chapterMatch) {
				currentChapter = parseInt(chapterMatch[1], 10);
				foundChapters.add(currentChapter);
				console.log(
					`  Chapitre ${currentChapter} détecté via élément ${elem.name}`,
				);
			}
		});

		// Si toujours aucun chapitre, utiliser le chapitre 1 par défaut
		if (foundChapters.size === 0) {
			console.log(
				"Aucun chapitre détecté, utilisation du chapitre 1 par défaut",
			);
			currentChapter = 1;
			foundChapters.add(1);
		}

		// 2. Essayer de trouver les versets
		// Essayer différentes approches de détection de versets

		// Approche 1: Paragraphes avec numéros de versets
		$("p").each((i, elem) => {
			const text = $(elem).text().trim();
			const verseMatch = text.match(/^(\d+)\s+(.+)/);

			if (verseMatch) {
				const verseNum = parseInt(verseMatch[1], 10);
				const verseText = verseMatch[2].trim();

				// Si verset 1 et pas au début, considérer un changement de chapitre
				if (verseNum === 1 && i > 0 && currentChapter < 150) {
					currentChapter++;
					console.log(
						`  Passage au chapitre ${currentChapter} (détecté via verset 1)`,
					);
				}

				console.log(
					`    Verset ${verseNum} (Chapitre ${currentChapter}): "${verseText.substring(0, 30)}..."`,
				);

				// Ajouter le verset à la base de données
				this.addVerse(bookId, currentChapter, verseNum, verseText);
				foundVerses++;
			}
		});

		// Si aucun verset n'a été trouvé, essayer d'autres approches
		if (foundVerses === 0) {
			console.warn(
				`ATTENTION: Aucun verset n'a été trouvé pour ${bookId}`,
			);
			console.log("Analyse du contenu pour motifs de versets...");

			// Récupérer tout le texte et chercher les motifs 1 texte, 2 texte, etc.
			const fullText = $("body").text();

			// Déboguer un extrait du texte complet
			console.log(`Extrait du texte: ${fullText.substring(0, 300)}...`);

			// Rechercher des motifs comme "1 Au commencement...", "2 Dieu dit..."
			const versePattern = /(\d+)\s+([^0-9][^\n]+)(?=\s+\d+\s+|$)/g;
			let match;

			while ((match = versePattern.exec(fullText)) !== null) {
				const verseNum = parseInt(match[1], 10);
				const verseText = match[2].trim();

				// Détection de changement de chapitre (si verset 1 après des versets plus élevés)
				if (verseNum === 1 && foundVerses > 0) {
					currentChapter++;
					console.log(
						`  Passage au chapitre ${currentChapter} (détecté via verset 1 dans le texte)`,
					);
				}

				console.log(
					`    Verset ${verseNum} (Chapitre ${currentChapter}): "${verseText.substring(0, 30)}..."`,
				);
				this.addVerse(bookId, currentChapter, verseNum, verseText);
				foundVerses++;
			}
		}

		console.log(
			`  Total: ${foundChapters.size} chapitres, ${foundVerses} versets trouvés`,
		);
	}

	// Ajoute un verset à la base de données
	addVerse(bookId, chapterNum, verseNum, text) {
		const { code } = this.config.translationInfo;

		// Échapper les apostrophes et autres caractères problématiques
		const escapedText = text.replace(/'/g, "''");

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

// Lancer le programme
main();

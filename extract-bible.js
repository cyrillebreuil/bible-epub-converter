const EPub = require("epub");
const cheerio = require("cheerio");
const fs = require("fs-extra");
const path = require("path");

// Point d'entrée principal
async function main() {
	try {
		// Configuration - ADAPTEZ CECI À VOTRE BIBLE
		const config = {
			epubPath: "./bible_liturgique.epub",
			translationInfo: {
				code: "aelf", // ex: seg21
				name: "Traduction Officielle Liturgique", // ex: Segond 21
				language: "Français",
				languageCode: "fra",
				regionCode: "FR",
			},
			// Optionnel: limiter à certains livres pour le test
			debugMode: true,
			debugBooks: ["GEN"], // Laissez vide pour tous les livres
			saveDebugHtml: true,
			debugDir: "./debug",
		};

		console.log(`Démarrage de l'extraction de ${config.epubPath}...`);

		// Créer le dossier de debug si nécessaire
		if (config.saveDebugHtml) {
			await fs.ensureDir(config.debugDir);
		}

		// Créer une instance du convertisseur
		const converter = new BibleConverter(config);

		// Lancer l'extraction
		await converter.extract();

		console.log("Extraction terminée avec succès!");
	} catch (error) {
		console.error("Erreur lors de l'extraction:", error);
		process.exit(1);
	}
}

// Classe principale du convertisseur
class BibleConverter {
	constructor(config) {
		this.config = config;
		this.epub = new EPub(config.epubPath);
		this.outputFile = `seed${config.translationInfo.code.toUpperCase()}.sql`;
		this.sqlStatements = [];
		this.bookMappings = this.initializeBookMappings();
		this.currentBook = null;
	}

	// Initialiser les correspondances entre noms de livres et codes
	initializeBookMappings() {
		// ADAPTEZ CES CORRESPONDANCES à votre Bible
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

	// Méthode principale d'extraction
	async extract() {
		return new Promise((resolve, reject) => {
			this.epub.on("end", async () => {
				try {
					console.log("EPUB chargé avec succès.");

					if (this.config.debugMode) {
						// En mode debug, afficher la structure complète
						console.log("\nStructure de l'EPUB:");
						console.log(`Titre: ${this.epub.metadata.title}`);
						console.log(`Créateur: ${this.epub.metadata.creator}`);
						console.log(`Éditeur: ${this.epub.metadata.publisher}`);
						console.log(`Langue: ${this.epub.metadata.language}`);

						console.log("\nTable des matières:");
						this.epub.toc.forEach((item, i) => {
							console.log(
								`${i + 1}. ${item.title} (${item.href})`,
							);
						});
					}

					// Commencer le fichier SQL
					this.startSqlFile();

					// Analyser la table des matières
					await this.processToc();

					// Finaliser le fichier SQL
					this.endSqlFile();

					// Écrire le fichier SQL final
					await fs.writeFile(
						this.outputFile,
						this.sqlStatements.join("\n"),
					);
					console.log(`\nFichier SQL généré: ${this.outputFile}`);

					resolve();
				} catch (error) {
					reject(error);
				}
			});

			this.epub.on("error", (err) => {
				reject(
					new Error(
						`Erreur lors du chargement de l'EPUB: ${err.message}`,
					),
				);
			});

			this.epub.parse();
		});
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

	// Traite la table des matières
	async processToc() {
		const toc = this.epub.toc;
		console.log(
			`\nTraitement de la table des matières (${toc.length} entrées)`,
		);

		for (let i = 0; i < toc.length; i++) {
			const tocItem = toc[i];

			const bookInfo = this.identifyBook(tocItem.title);

			if (bookInfo) {
				// Vérifier si nous devons traiter ce livre en mode debug
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
	}

	// Identifie un livre biblique
	identifyBook(title) {
		const cleanTitle = title.trim();

		// Correspondance directe
		if (this.bookMappings[cleanTitle]) {
			return {
				id: this.bookMappings[cleanTitle],
				name: cleanTitle,
			};
		}

		// Correspondance partielle
		for (const [bookName, bookId] of Object.entries(this.bookMappings)) {
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

	// Récupère le contenu d'un chapitre EPUB
	async getEpubChapter(href) {
		return new Promise((resolve, reject) => {
			this.epub.getChapter(href, (err, text) => {
				if (err) return reject(err);
				resolve(text);
			});
		});
	}

	// Traite le contenu d'un livre
	async processBookContent(href, bookId) {
		try {
			const content = await this.getEpubChapter(href);

			// En mode debug, sauvegarder le HTML pour analyse
			if (this.config.saveDebugHtml) {
				await fs.writeFile(
					`${this.config.debugDir}/${bookId}_content.html`,
					content,
				);
				console.log(
					`HTML sauvegardé dans ${this.config.debugDir}/${bookId}_content.html`,
				);
			}

			const $ = cheerio.load(content);

			// En mode debug, analyser la structure
			if (this.config.debugMode) {
				console.log("\nAnalyse de la structure HTML:");

				// Trouver les balises principales
				console.log("Balises de premier niveau:");
				$("body > *")
					.slice(0, 5)
					.each((i, elem) => {
						console.log(
							`  ${i + 1}. <${elem.name}> classe="${$(elem).attr("class") || ""}" id="${$(elem).attr("id") || ""}"`,
						);
					});

				// Rechercher des motifs typiques pour les chapitres/versets
				console.log("\nRecherche d'éléments de chapitre et verset:");

				// Classes contenant "chapter" ou "chapitre"
				$('[class*="chapter"], [class*="chapitre"]')
					.slice(0, 3)
					.each((i, elem) => {
						console.log(
							`  Chapitre potentiel ${i + 1}: <${elem.name}> classe="${$(elem).attr("class") || ""}"`,
						);
						console.log(
							`    Contenu: "${$(elem).text().substring(0, 50)}..."`,
						);
					});

				// Classes contenant "verse" ou "verset"
				$('[class*="verse"], [class*="verset"]')
					.slice(0, 3)
					.each((i, elem) => {
						console.log(
							`  Verset potentiel ${i + 1}: <${elem.name}> classe="${$(elem).attr("class") || ""}"`,
						);
						console.log(
							`    Contenu: "${$(elem).text().substring(0, 50)}..."`,
						);
					});

				// Recherche de schémas numériques
				console.log(
					"\nAnalyse des paragraphes pour détecter des motifs de versets:",
				);
				$("p")
					.slice(0, 5)
					.each((i, elem) => {
						const text = $(elem).text().trim();
						console.log(
							`  P${i + 1}: "${text.substring(0, 70)}..."`,
						);

						// Tenter de détecter des motifs de versets
						const matches = text.match(/^(\d+)[\s\.]+(.*)/);
						if (matches) {
							console.log(`    -> Possible verset ${matches[1]}`);
						}
					});
			}

			// Extraire les chapitres et versets
			await this.extractChaptersAndVerses($, bookId);
		} catch (error) {
			console.error(
				`Erreur lors du traitement de ${bookId} (${href}):`,
				error,
			);
		}
	}

	// Extrait les chapitres et versets
	// *** CETTE MÉTHODE DOIT ÊTRE ADAPTÉE À LA STRUCTURE SPÉCIFIQUE DE VOTRE EPUB ***
	async extractChaptersAndVerses($, bookId) {
		console.log("Démarrage de l'extraction des chapitres et versets...");

		// C'EST ICI QUE VOUS DEVEZ ADAPTER LE CODE À VOTRE EPUB
		// Les commentaires ci-dessous décrivent plusieurs approches possibles

		// APPROCHE 1: Si les chapitres sont clairement délimités dans le HTML
		// $('div.chapter, section.chapter').each((i, chapterElem) => { ... });

		// APPROCHE 2: Si les chapitres ne sont pas délimités mais les versets sont numérotés
		// comme "1 Au commencement..." dans des paragraphes

		// APPROCHE 3: Si le contenu est structuré par numéros de chapitre

		// EXEMPLE GÉNÉRIQUE - À ADAPTER!
		let currentChapter = 1; // Par défaut, commencer au chapitre 1
		let foundChapters = new Set();

		// Essayer de trouver des éléments qui pourraient indiquer un chapitre
		$("h1, h2, h3, h4, h5, h6, .chapter, .chapitre").each((i, elem) => {
			const text = $(elem).text().trim();

			// Chercher un motif comme "Chapitre 1" ou simplement "1"
			const chapterMatch = text.match(/(?:chapitre|chapter)?\s*(\d+)/i);

			if (chapterMatch) {
				currentChapter = parseInt(chapterMatch[1], 10);
				foundChapters.add(currentChapter);
				console.log(`  Détecté chapitre ${currentChapter}`);
			}
		});

		// Si aucun chapitre n'a été trouvé, avertir
		if (foundChapters.size === 0) {
			console.warn(`  ATTENTION: Aucun chapitre détecté pour ${bookId}`);
		}

		// Maintenant chercher les versets
		// C'est ici que vous devez adapter le code à la structure de votre EPUB

		// EXEMPLE - chercher des paragraphes commençant par un nombre
		$("p").each((i, elem) => {
			const text = $(elem).text().trim();

			// Motif: nombre suivi d'un espace ou d'un point, puis du texte
			const verseMatch = text.match(/^(\d+)[\s\.]+(.+)/);

			if (verseMatch) {
				const verseNum = parseInt(verseMatch[1], 10);
				const verseText = verseMatch[2].trim();

				if (verseNum === 1) {
					// Si c'est le verset 1, on pourrait être dans un nouveau chapitre
					// (si les chapitres ne sont pas clairement délimités)
					// Logique pour gérer de nouveaux chapitres ici
				}

				console.log(
					`    Verset ${verseNum} (Chapitre ${currentChapter})`,
				);

				// Ajouter le verset à la base de données
				this.addVerse(bookId, currentChapter, verseNum, verseText);
			}
		});
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

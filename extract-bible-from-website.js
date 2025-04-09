const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs-extra");
const path = require("path");

// Mappage des codes de livres utilisés par AELF vers les codes standard
const bookCodeMappings = {
	// Ancien Testament
	Gn: "GEN", // Genèse
	Ex: "EXO", // Exode
	Lv: "LEV", // Lévitique
	Nb: "NUM", // Nombres
	Dt: "DEU", // Deutéronome
	Jos: "JOS", // Josué
	Jg: "JDG", // Juges
	Rt: "RUT", // Ruth
	"1S": "1SA", // 1 Samuel
	"2S": "2SA", // 2 Samuel
	"1R": "1KI", // 1 Rois
	"2R": "2KI", // 2 Rois
	"1Ch": "1CH", // 1 Chroniques
	"2Ch": "2CH", // 2 Chroniques
	Esd: "EZR", // Esdras
	Ne: "NEH", // Néhémie
	Tb: "TOB", // Tobie (deutérocanonique)
	Jdt: "JDT", // Judith (deutérocanonique)
	Est: "EST", // Esther
	"1M": "1MA", // 1 Maccabées (deutérocanonique)
	"2M": "2MA", // 2 Maccabées (deutérocanonique)
	Jb: "JOB", // Job
	Ps: "PSA", // Psaumes
	Pr: "PRO", // Proverbes
	Qo: "ECC", // Ecclésiaste (Qohélet)
	Ct: "SNG", // Cantique des Cantiques
	Sg: "WIS", // Sagesse (deutérocanonique)
	Si: "SIR", // Siracide (deutérocanonique)
	Is: "ISA", // Isaïe
	Jr: "JER", // Jérémie
	Lm: "LAM", // Lamentations
	Ba: "BAR", // Baruch (deutérocanonique)
	Ez: "EZK", // Ézéchiel
	Dn: "DAN", // Daniel
	Os: "HOS", // Osée
	Jl: "JOL", // Joël
	Am: "AMO", // Amos
	Ab: "OBA", // Abdias
	Jon: "JON", // Jonas
	Mi: "MIC", // Michée
	Na: "NAM", // Nahum
	Ha: "HAB", // Habacuc
	So: "ZEP", // Sophonie
	Ag: "HAG", // Aggée
	Za: "ZEC", // Zacharie
	Ml: "MAL", // Malachie

	// Nouveau Testament
	Mt: "MAT", // Matthieu
	Mc: "MRK", // Marc
	Lc: "LUK", // Luc
	Jn: "JHN", // Jean
	Ac: "ACT", // Actes
	Rm: "ROM", // Romains
	"1Co": "1CO", // 1 Corinthiens
	"2Co": "2CO", // 2 Corinthiens
	Ga: "GAL", // Galates
	Ep: "EPH", // Éphésiens
	Ph: "PHP", // Philippiens
	Col: "COL", // Colossiens
	"1Th": "1TH", // 1 Thessaloniciens
	"2Th": "2TH", // 2 Thessaloniciens
	"1Tm": "1TI", // 1 Timothée
	"2Tm": "2TI", // 2 Timothée
	Tt: "TIT", // Tite
	Phm: "PHM", // Philémon
	He: "HEB", // Hébreux
	Jc: "JAS", // Jacques
	"1P": "1PE", // 1 Pierre
	"2P": "2PE", // 2 Pierre
	"1Jn": "1JN", // 1 Jean
	"2Jn": "2JN", // 2 Jean
	"3Jn": "3JN", // 3 Jean
	Jude: "JUD", // Jude
	Ap: "REV", // Apocalypse
};

// Gestion spéciale de la numérotation des psaumes entre AELF et la standard
const psalmNumberMappings = {
	// Psaumes qui sont divisés ou fusionnés dans la traduction AELF
	"9A": 9,
	"9B": 10,
	"113A": 114,
	"113B": 115,
	"114-115": 116, // Si présent comme ça
	"146-147": 147, // Si présent comme ça
};

// Configuration
const config = {
	baseUrl: "https://www.aelf.org/bible",
	translationInfo: {
		code: "aelf",
		name: "Traduction Officielle Liturgique",
		language: "Français",
		languageCode: "fra",
		regionCode: "FR",
	},
	outputFile: "seedAELF.sql",
	requestDelay: 100, // 1 seconde entre les requêtes
	debugMode: false, // Mettre à true pour tester seulement quelques livres
	debugBooks: ["GEN", "MAT", "PSA", "LUK"], // Livres à traiter en mode debug (PSA ajouté)
	maxRetries: 3,
	cacheDir: "./cache",
	logDir: "./logs",
};

class BibleExtractor {
	constructor(config) {
		this.config = config;
		this.sqlStatements = [];
		this.booksToProcess = new Map(); // Stocke les livres avec leur nombre de chapitres
		this.processedBooks = new Set();
		this.bookNames = new Map(); // Stocke les noms complets des livres

		// Créer les dossiers nécessaires
		fs.ensureDirSync(this.config.cacheDir);
		fs.ensureDirSync(this.config.logDir);

		// Fichier de log
		this.logFile = path.join(
			this.config.logDir,
			`extraction_${new Date().toISOString().replace(/[:.]/g, "-")}.log`,
		);
		fs.writeFileSync(
			this.logFile,
			`Démarrage de l'extraction: ${new Date().toISOString()}\n`,
		);
	}

	log(message) {
		const logMessage = `[${new Date().toISOString()}] ${message}`;
		console.log(logMessage);
		fs.appendFileSync(this.logFile, logMessage + "\n");
	}

	// Initialise le fichier SQL
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

	// Récupère la page d'index de la Bible pour obtenir tous les livres
	async fetchBibleIndex() {
		this.log("Récupération de l'index de la Bible...");

		try {
			// Récupérer la page d'accueil
			const response = await axios.get(this.config.baseUrl);
			const $ = cheerio.load(response.data);

			// Explorer les onglets (Ancien Testament, Nouveau Testament, Psaumes)
			const tabPanes = $(".tab-content .tab-pane");

			tabPanes.each((i, tabPane) => {
				const tabId = $(tabPane).attr("id");
				const isNewTestament = tabId === "nouveau";
				const isPsalms = tabId === "psaumes";

				// Récupérer tous les liens de livres dans cet onglet
				$(tabPane)
					.find("a")
					.each((j, link) => {
						const href = $(link).attr("href");

						// Vérifier si c'est un lien vers un livre biblique
						if (href && href.includes("/bible/")) {
							// Extraire le code du livre et le nom
							const parts = href.split("/");
							if (parts.length >= 3) {
								const aelfCode = parts[2]; // Code utilisé par AELF
								const name = $(link).text().trim();

								// Convertir en code standard
								let standardCode = bookCodeMappings[aelfCode];

								// Traitement spécial pour l'onglet des psaumes
								if (isPsalms) {
									standardCode = "PSA"; // Tous les psaumes utilisent le même code

									// Extraire le numéro du psaume
									const psalmNum = parts[3]; // Le numéro est dans l'URL

									// Ajouter directement le psaume à traiter
									this.booksToProcess.set(`Ps_${psalmNum}`, {
										standardCode,
										name: `Psaume ${psalmNum}`,
										chaptersCount: 1, // Les psaumes ont toujours un seul chapitre
										isNewTestament: false,
										isPsalm: true,
										psalmNumber: psalmNum,
									});

									this.log(
										`Psaume identifié: ${name} (${psalmNum})`,
									);
									return; // Continuer avec le prochain lien
								}

								if (standardCode) {
									// Vérifier si on doit traiter ce livre en mode debug
									if (
										this.config.debugMode &&
										this.config.debugBooks &&
										this.config.debugBooks.length > 0 &&
										!this.config.debugBooks.includes(
											standardCode,
										)
									) {
										return; // Passer au suivant
									}

									// Stocker le livre à traiter
									this.booksToProcess.set(aelfCode, {
										standardCode,
										name: name,
										chaptersCount: 0, // Sera mis à jour plus tard
										isNewTestament: isNewTestament,
									});

									this.log(
										`Livre identifié: ${name} (${aelfCode} → ${standardCode})`,
									);
								}
							}
						}
					});
			});

			this.log(`Total de ${this.booksToProcess.size} livres identifiés.`);
		} catch (error) {
			this.log(
				`Erreur lors de la récupération de l'index: ${error.message}`,
			);
			throw error;
		}
	}

	// Détermine le nombre de chapitres pour chaque livre
	async determineChaptersCount() {
		this.log("Détermination du nombre de chapitres pour chaque livre...");

		// Pour chaque livre identifié
		for (const [aelfCode, bookInfo] of this.booksToProcess.entries()) {
			// Ignorer les psaumes car ils ont déjà leur chaptersCount défini
			if (bookInfo.isPsalm) continue;

			try {
				this.log(`Analyse de ${bookInfo.name} (${aelfCode})...`);

				// Construire l'URL du premier chapitre
				const bookUrl = `${this.config.baseUrl}/${aelfCode}/1`;

				// Récupérer la page du premier chapitre
				const response = await axios.get(bookUrl);
				const $ = cheerio.load(response.data);

				// Récupérer la liste des chapitres depuis le menu déroulant
				let maxChapter = 1;

				// Chercher dans les deux menus déroulants possibles
				$(".dropdown-menu li a").each((i, elem) => {
					const href = $(elem).attr("href");
					if (href && href.includes(`/bible/${aelfCode}/`)) {
						const parts = href.split("/");
						const chapterNum = parseInt(
							parts[parts.length - 1],
							10,
						);
						if (!isNaN(chapterNum) && chapterNum > maxChapter) {
							maxChapter = chapterNum;
						}
					}
				});

				if (maxChapter > 1) {
					this.log(
						`${bookInfo.name} (${bookInfo.standardCode}): ${maxChapter} chapitres.`,
					);

					// Mettre à jour le nombre de chapitres
					bookInfo.chaptersCount = maxChapter;
					this.booksToProcess.set(aelfCode, bookInfo);

					// Stocker le nom officiel depuis le titre de la page
					const pageTitle = $("h1.m-b-10").first().text().trim();
					if (pageTitle) {
						this.bookNames.set(bookInfo.standardCode, pageTitle);
					}
				} else {
					this.log(
						`Avertissement: Seulement un chapitre trouvé pour ${bookInfo.name} (${bookInfo.standardCode}).`,
					);
					// On considère qu'il y a au moins un chapitre
					bookInfo.chaptersCount = 1;
					this.booksToProcess.set(aelfCode, bookInfo);
				}

				// Pause pour ne pas surcharger le serveur
				await this.delay();
			} catch (error) {
				this.log(
					`Erreur lors de l'analyse de ${aelfCode}: ${error.message}`,
				);
				// On continue avec le livre suivant
			}
		}
	}

	// Traite un livre spécifique
	async processBook(aelfCode, bookInfo) {
		const { standardCode, name, chaptersCount, isPsalm, psalmNumber } =
			bookInfo;

		if (
			this.processedBooks.has(
				standardCode + (psalmNumber ? `_${psalmNumber}` : ""),
			)
		) {
			this.log(`Livre ${name} (${standardCode}) déjà traité, ignoré.`);
			return;
		}

		// Si c'est un psaume, traitement spécial
		if (isPsalm) {
			await this.processPsalm(psalmNumber, standardCode, name);
			return;
		}

		this.log(
			`Traitement du livre: ${name} (${standardCode}), ${chaptersCount} chapitres.`,
		);

		// Ajouter la traduction du livre
		const bookName = this.bookNames.get(standardCode) || name;
		const escapedName = bookName.replace(/'/g, "''");

		this.sqlStatements.push(`
      INSERT INTO "bookTranslations" ("bookID", "translationID", "name") VALUES
      ('${standardCode}', (SELECT "id" FROM "translations" WHERE "code" = '${this.config.translationInfo.code}'), '${escapedName}')
      ON CONFLICT ("bookID", "translationID") DO NOTHING;
    `);

		// Traiter chaque chapitre
		for (let chapterNum = 1; chapterNum <= chaptersCount; chapterNum++) {
			await this.processChapter(aelfCode, standardCode, chapterNum);

			// Pause entre les chapitres
			if (chapterNum < chaptersCount) {
				await this.delay();
			}
		}

		// Marquer ce livre comme traité
		this.processedBooks.add(standardCode);
		this.log(`Livre ${name} (${standardCode}) traité avec succès.`);
	}

	// Traite un psaume spécifique
	async processPsalm(psalmNumber, standardCode, name) {
		this.log(`Traitement du psaume ${psalmNumber}`);

		// Normaliser le numéro de chapitre pour notre base de données
		// En cas de psaumes spéciaux (9A, 9B, etc.), convertir selon le mapping
		let normalizedPsalmNumber = psalmNumber;
		if (psalmNumberMappings[psalmNumber]) {
			normalizedPsalmNumber = psalmNumberMappings[psalmNumber];
			this.log(
				`Conversion: Psaume ${psalmNumber} -> ${normalizedPsalmNumber} (convention standard)`,
			);
		} else {
			// Si c'est un nombre simple, le convertir en nombre
			const numericPsalm = parseInt(psalmNumber, 10);
			if (!isNaN(numericPsalm)) {
				normalizedPsalmNumber = numericPsalm;
			}
		}

		// Construire l'URL du psaume
		const psalmUrl = `${this.config.baseUrl}/Ps/${psalmNumber}`;

		// Vérifier si nous avons déjà une version en cache
		const cacheFilePath = path.join(
			this.config.cacheDir,
			`Ps_${psalmNumber}.html`,
		);

		try {
			let htmlContent;
			if (fs.existsSync(cacheFilePath)) {
				// Utiliser la version du cache
				this.log(`Utilisation du cache pour Psaume ${psalmNumber}`);
				htmlContent = fs.readFileSync(cacheFilePath, "utf8");
			} else {
				// Récupérer la page et la mettre en cache
				const response = await this.fetchWithRetry(psalmUrl);
				htmlContent = response.data;
				fs.writeFileSync(cacheFilePath, htmlContent);
			}

			// Parser le HTML
			const $ = cheerio.load(htmlContent);

			// Titre officiel du psaume pour la traduction
			const psalmTitle =
				$("h1.m-b-10").first().text().trim() || `Psaume ${psalmNumber}`;
			this.log(`Titre du psaume: ${psalmTitle}`);

			// Extraire les versets
			this.extractPsalmVerses(
				$,
				standardCode,
				normalizedPsalmNumber,
				psalmNumber,
			);

			// Marquer ce psaume comme traité
			this.processedBooks.add(`${standardCode}_${psalmNumber}`);
		} catch (error) {
			this.log(
				`Erreur lors du traitement du Psaume ${psalmNumber}: ${error.message}`,
			);
		}
	}

	// Traite un chapitre spécifique
	async processChapter(aelfCode, standardCode, chapterNum) {
		this.log(`  Traitement de ${standardCode} chapitre ${chapterNum}...`);

		try {
			// Construire l'URL du chapitre
			const chapterUrl = `${this.config.baseUrl}/${aelfCode}/${chapterNum}`;

			// Vérifier si nous avons déjà une version en cache
			const cacheFilePath = path.join(
				this.config.cacheDir,
				`${aelfCode}_${chapterNum}.html`,
			);

			let htmlContent;
			if (fs.existsSync(cacheFilePath)) {
				// Utiliser la version du cache
				this.log(
					`    Utilisation du cache pour ${standardCode} ${chapterNum}`,
				);
				htmlContent = fs.readFileSync(cacheFilePath, "utf8");
			} else {
				// Récupérer la page et la mettre en cache
				const response = await this.fetchWithRetry(chapterUrl);
				htmlContent = response.data;
				fs.writeFileSync(cacheFilePath, htmlContent);
			}

			// Parser le HTML
			const $ = cheerio.load(htmlContent);

			// Ajouter l'entrée de chapitre
			this.sqlStatements.push(`
        INSERT INTO "chapters" ("bookID", "number") VALUES
        ('${standardCode}', ${chapterNum})
        ON CONFLICT ("bookID", "number") DO NOTHING;
      `);

			// Extraire les versets
			const versesCount = this.extractVerses($, standardCode, chapterNum);
			this.log(`    Extrait ${versesCount} versets.`);
		} catch (error) {
			this.log(
				`    Erreur lors du traitement de ${standardCode} ${chapterNum}: ${error.message}`,
			);
		}
	}

	// Extrait les versets d'une page de chapitre
	extractVerses($, standardCode, chapterNum) {
		let verseCount = 0;

		// Vérifier s'il y a des éléments avec la classe "verset"
		const verseElements = $(".verset");

		if (verseElements.length > 0) {
			// Utiliser les éléments avec classe "verset"
			verseElements.each((i, element) => {
				// Récupérer le numéro de verset depuis l'attribut id
				const verseNum = parseInt($(element).attr("id"), 10);

				if (!isNaN(verseNum)) {
					// Récupérer le texte du verset
					let verseText = $(element).text().trim();

					// Nettoyer le texte
					verseText = this.cleanVerseText(verseText);

					if (verseText) {
						const escapedText = verseText.replace(/'/g, "''");

						// Ajouter la requête SQL pour ce verset
						this.sqlStatements.push(`
              INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
              ((SELECT "id" FROM "chapters" WHERE "bookID" = '${standardCode}' AND "number" = ${chapterNum}),
              (SELECT "id" FROM "translations" WHERE "code" = '${this.config.translationInfo.code}'),
              ${verseNum},
              '${escapedText}')
              ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            `);

						verseCount++;
					}
				}
			});
		} else {
			// Utiliser les paragraphes qui contiennent des numéros de versets
			const paragraphs = $("p");

			paragraphs.each((i, paragraph) => {
				// Chercher si le paragraphe contient un numéro de verset (classe text-danger ou verse_number)
				const verseNumElem = $(paragraph)
					.find(".text-danger, .verse_number")
					.first();

				if (verseNumElem.length) {
					// Obtenir le texte du numéro de verset
					const verseNumText = verseNumElem.text().trim();
					const verseNum = parseInt(verseNumText, 10);

					if (!isNaN(verseNum)) {
						// Cloner le paragraphe pour manipulation
						const $paragraph = $(paragraph).clone();

						// Supprimer l'élément du numéro de verset
						$paragraph.find(".text-danger, .verse_number").remove();

						// Récupérer le texte du verset
						let verseText = $paragraph.text().trim();

						// Nettoyer le texte
						verseText = this.cleanVerseText(verseText);

						if (verseText) {
							const escapedText = verseText.replace(/'/g, "''");

							// Ajouter la requête SQL pour ce verset
							this.sqlStatements.push(`
                INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
                ((SELECT "id" FROM "chapters" WHERE "bookID" = '${standardCode}' AND "number" = ${chapterNum}),
                (SELECT "id" FROM "translations" WHERE "code" = '${this.config.translationInfo.code}'),
                ${verseNum},
                '${escapedText}')
                ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
              `);

							verseCount++;
						}
					}
				}
			});
		}

		return verseCount;
	}

	// Extrait les versets d'un psaume
	extractPsalmVerses($, standardCode, chapterNum, originalPsalmNumber) {
		let verseCount = 0;

		// Les psaumes ont une structure différente
		const verseElements = $("p");

		// Définir le numéro du chapitre standardisé
		const normalizedChapterNum = chapterNum;

		// Ajouter l'entrée de chapitre
		this.sqlStatements.push(`
        INSERT INTO "chapters" ("bookID", "number") VALUES
        ('${standardCode}', ${normalizedChapterNum})
        ON CONFLICT ("bookID", "number") DO NOTHING;
    `);

		// Recherche du titre du psaume pour l'ajouter comme "verset 0" ou métadonnée
		const psalmTitle = $("h1.m-b-10").first().text().trim();
		const psalmSubtitle = $(".verse_reference").first().text().trim();

		if (psalmTitle) {
			// Ajouter le titre comme verset d'information (numéro 0)
			const title = `${psalmTitle}${psalmSubtitle ? ` - ${psalmSubtitle}` : ""}`;
			const escapedTitle = title.replace(/'/g, "''");

			this.sqlStatements.push(`
            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = '${standardCode}' AND "number" = ${normalizedChapterNum}),
            (SELECT "id" FROM "translations" WHERE "code" = '${this.config.translationInfo.code}'),
            0,
            '${escapedTitle}')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
        `);
		}

		// Parcourir les versets
		verseElements.each((i, element) => {
			// La structure des psaumes peut varier, vérifions plusieurs façons d'obtenir le numéro
			let verseNum;

			// Rechercher un élément avec une classe qui contient le numéro de verset
			const verseNumElem = $(element).find(".text-danger").first();

			if (verseNumElem.length) {
				verseNum = parseInt(verseNumElem.text().trim(), 10);

				// Si on a trouvé un numéro de verset valide
				if (!isNaN(verseNum)) {
					// Cloner l'élément pour manipulation
					const $verseContent = $(element).clone();

					// Supprimer l'élément du numéro de verset et les autres éléments non textuels
					$verseContent
						.find(".text-danger, .verse_reference")
						.remove();

					// Récupérer le texte du verset
					let verseText = $verseContent.text().trim();

					// Nettoyer le texte
					verseText = this.cleanVerseText(verseText);

					if (verseText) {
						const escapedText = verseText.replace(/'/g, "''");

						this.log(
							`      Psaume ${originalPsalmNumber} (normalisé: ${normalizedChapterNum}), verset ${verseNum}: ${verseText.substring(0, 30)}...`,
						);

						// Ajouter la requête SQL pour ce verset
						this.sqlStatements.push(`
                        INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
                        ((SELECT "id" FROM "chapters" WHERE "bookID" = '${standardCode}' AND "number" = ${normalizedChapterNum}),
                        (SELECT "id" FROM "translations" WHERE "code" = '${this.config.translationInfo.code}'),
                        ${verseNum},
                        '${escapedText}')
                        ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
                    `);

						verseCount++;
					}
				}
			}
		});

		this.log(
			`    Extrait ${verseCount} versets du Psaume ${originalPsalmNumber}`,
		);
		return verseCount;
	}

	// Nettoie le texte d'un verset
	cleanVerseText(text) {
		// Supprimer les espaces multiples
		let cleanText = text.replace(/\s+/g, " ");

		// Supprimer les annotations de type (a), (b), etc.
		cleanText = cleanText.replace(/\([a-z]\)/g, "");

		// Supprimer les espaces avant la ponctuation
		cleanText = cleanText.replace(/\s+([.,;:!?»])/g, "$1");

		// Supprimer les espaces après les guillemets ouvrants
		cleanText = cleanText.replace(/([«])\s+/g, "$1");

		// Supprimer les espaces de début et fin
		cleanText = cleanText.trim();

		return cleanText;
	}

	// Récupère une URL avec gestion des erreurs et tentatives
	async fetchWithRetry(url, retryCount = 0) {
		try {
			return await axios.get(url, {
				maxRedirects: 5,
				timeout: 10000,
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
				},
			});
		} catch (error) {
			if (retryCount < this.config.maxRetries) {
				this.log(
					`Tentative échouée pour ${url}, nouvel essai ${retryCount + 1}/${this.config.maxRetries}`,
				);
				// Attendre plus longtemps entre les tentatives
				await this.delay(this.config.requestDelay * 2);
				return this.fetchWithRetry(url, retryCount + 1);
			} else {
				this.log(
					`Échec après ${this.config.maxRetries} tentatives pour ${url}`,
				);
				throw error;
			}
		}
	}

	// Attend un délai défini
	async delay(ms = this.config.requestDelay) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	// Méthode principale d'extraction
	async extract() {
		try {
			this.log("Démarrage de l'extraction...");

			// Initialiser le fichier SQL
			this.startSqlFile();

			// Récupérer l'index de la Bible
			await this.fetchBibleIndex();

			// Déterminer le nombre de chapitres pour chaque livre
			await this.determineChaptersCount();

			// Traiter chaque livre
			for (const [aelfCode, bookInfo] of this.booksToProcess.entries()) {
				if (bookInfo.chaptersCount > 0 || bookInfo.isPsalm) {
					await this.processBook(aelfCode, bookInfo);
				}
			}

			// Finaliser le fichier SQL
			this.endSqlFile();

			// Écrire le fichier SQL
			await fs.writeFile(
				this.config.outputFile,
				this.sqlStatements.join("\n"),
			);
			this.log(`Fichier SQL généré: ${this.config.outputFile}`);

			this.log("Extraction terminée avec succès!");
			return true;
		} catch (error) {
			this.log(`Erreur lors de l'extraction: ${error.message}`);
			// Sauvegarde de ce qui a été traité jusqu'à présent
			if (this.sqlStatements.length > 0) {
				this.endSqlFile();
				const errorFile = `error_${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
				await fs.writeFile(errorFile, this.sqlStatements.join("\n"));
				this.log(`Sauvegarde partielle écrite dans: ${errorFile}`);
			}
			return false;
		}
	}
}

// Point d'entrée principal
async function main() {
	const extractor = new BibleExtractor(config);
	await extractor.extract();
}

main().catch((error) => {
	console.error("Erreur fatale:", error);
	process.exit(1);
});

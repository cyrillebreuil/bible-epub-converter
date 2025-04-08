BEGIN;

    INSERT INTO "translations" ("code", "name", "language", "languageCode", "regionCode") VALUES
    ('aelf', 'Traduction Officielle Liturgique', 'Français', 'fra', 'FR')
    ON CONFLICT ("code") DO NOTHING;

    INSERT INTO "testamentTranslations" ("isNewTestament", "translationID", "name") VALUES
    (FALSE, (SELECT "id" FROM "translations" WHERE "code" = 'aelf'), 'Ancien Testament'),
    (TRUE, (SELECT "id" FROM "translations" WHERE "code" = 'aelf'), 'Nouveau Testament')
    ON CONFLICT ("isNewTestament", "translationID") DO NOTHING;
    

      INSERT INTO "bookTranslations" ("bookID", "translationID", "name") VALUES
      ('GEN', (SELECT "id" FROM "translations" WHERE "code" = 'aelf'), 'Genèse')
      ON CONFLICT ("bookID", "translationID") DO NOTHING;
      

    INSERT INTO "chapters" ("bookID", "number") VALUES
    ('GEN', 1)
    ON CONFLICT ("bookID", "number") DO NOTHING;
    

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            1,
            'AU COMMENCEMENT, Dieu créa le ciel et la terre.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            2,
            'La terre était informe et vide les ténèbres étaient au-dessus de l’abîme et le souffle de Dieu planait au-dessus des eaux.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            3,
            'Dieu dit: «Que la lumière soit.» Et la lumière fut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            4,
            'Dieu vit que la lumière était bonne, et Dieu sépara la lumière des ténèbres.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            5,
            'Dieu appela la lumière «jour», il appela les ténèbres «nuit». Il y eut un soir, il y eut un matin: premier jour.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            6,
            'Et Dieu dit: «Qu’il y ait un firmament au milieu des eaux, et qu’il sépare les eaux.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            7,
            'Dieu fit le firmament, il sépara les eaux qui sont au-dessous du firmament et les eaux qui sont au-dessus. Et ce fut ainsi.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            8,
            'Dieu appela le firmament «ciel». Il y eut un soir, il y eut un matin: deuxième jour.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            9,
            'Et Dieu dit: «Les eaux qui sont au-dessous du ciel, qu’elles se rassemblent en un seul lieu, et que paraisse la terre ferme.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            10,
            'Dieu appela la terre ferme «terre», et il appela la masse des eaux «mer». Et Dieu vit que cela était bon.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            11,
            'Dieu dit: «Que la terre produise l’herbe, la plante qui porte sa semence, et que, sur la terre, l’arbre à fruit donne, selon son espèce, le fruit qui porte sa semence.» Et ce fut ainsi.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            12,
            'La terre produisit l’herbe, la plante qui porte sa semence, selon son espèce, et l’arbre qui donne, selon son espèce, le fruit qui porte sa semence. Et Dieu vit que cela était bon.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            13,
            'Il y eut un soir, il y eut un matin: troisième jour.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            14,
            'Et Dieu dit: «Qu’il y ait des luminaires au firmament du ciel, pour séparer le jour de la nuit; qu’ils servent de signes pour marquer les fêtes, les jours et les années;')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            15,
            'et qu’ils soient, au firmament du ciel, des luminaires pour éclairer la terre.» Et ce fut ainsi.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            16,
            'Dieu fit les deux grands luminaires: le plus grand pour commander au jour, le plus petit pour commander à la nuit; il fit aussi les étoiles.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            17,
            'Dieu les plaça au firmament du ciel pour éclairer la terre,')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            18,
            'pour commander au jour et à la nuit, pour séparer la lumière des ténèbres. Et Dieu vit que cela était bon.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            19,
            'Il y eut un soir, il y eut un matin: quatrième jour.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            20,
            'Et Dieu dit: «Que les eaux foisonnent d’une profusion d’êtres vivants, et que les oiseaux volent au-dessus de la terre, sous le firmament du ciel.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            21,
            'Dieu créa, selon leur espèce, les grands monstres marins, tous les êtres vivants qui vont et viennent et foisonnent dans les eaux, et aussi, selon leur espèce, tous les oiseaux qui volent. Et Dieu vit que cela était bon.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            22,
            'Dieu les bénit par ces paroles: «Soyez féconds et multipliez-vous, remplissez les mers, que les oiseaux se multiplient sur la terre.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            23,
            'Il y eut un soir, il y eut un matin: cinquième jour.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            24,
            'Et Dieu dit: «Que la terre produise des êtres vivants selon leur espèce, bestiaux, bestioles et bêtes sauvages selon leur espèce.» Et ce fut ainsi.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            25,
            'Dieu fit les bêtes sauvages selon leur espèce, les bestiaux selon leur espèce, et toutes les bestioles de la terre selon leur espèce. Et Dieu vit que cela était bon.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            26,
            'Dieu dit: «Faisons l’homme à notre image, selon notre ressemblance. Qu’il soit le maître des poissons de la mer, des oiseaux du ciel, des bestiaux, de toutes les bêtes sauvages, et de toutes les bestioles qui vont et viennent sur la terre.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            27,
            'Dieu créa l’homme à son image, à l’image de Dieu il le créa, il les créa homme et femme.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            28,
            'Dieu les bénit et leur dit: «Soyez féconds et multipliez-vous, remplissez la terre et soumettez-la. Soyez les maîtres des poissons de la mer, des oiseaux du ciel, et de tous les animaux qui vont et viennent sur la terre.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            29,
            'Dieu dit encore: «Je vous donne toute plante qui porte sa semence sur toute la surface de la terre, et tout arbre dont le fruit porte sa semence: telle sera votre nourriture.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            30,
            'À tous les animaux de la terre, à tous les oiseaux du ciel, à tout ce qui va et vient sur la terre et qui a souffle de vie, je donne comme nourriture toute herbe verte.» Et ce fut ainsi.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 1),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            31,
            'Et Dieu vit tout ce qu’il avait fait; et voici: cela était très bon. Il y eut un soir, il y eut un matin: sixième jour.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

    INSERT INTO "chapters" ("bookID", "number") VALUES
    ('GEN', 2)
    ON CONFLICT ("bookID", "number") DO NOTHING;
    

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            1,
            'Ainsi furent achevés le ciel et la terre, et tout leur déploiement.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            2,
            'Le septième jour, Dieu avait achevé l’œuvre qu’il avait faite. Il se reposa, le septième jour, de toute l’œuvre qu’il avait faite.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            3,
            'Et Dieu bénit le septième jour: il le sanctifia puisque, ce jour-là, il se reposa de toute l’œuvre de création qu’il avait faite.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            4,
            'Telle fut l’origine du ciel et de la terre lorsqu’ils furent créés.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            5,
            'Lorsque le Seigneur Dieu fit la terre et le ciel, aucun buisson n’était encore sur la terre, aucune herbe n’avait poussé, parce que le Seigneur Dieu n’avait pas encore fait pleuvoir sur la terre, et il n’y avait pas d’homme pour travailler le sol. Mais une source montait de la terre et irriguait toute la surface du sol. Alors le Seigneur Dieu modela l’homme avec la poussière tirée du sol; il insuffla dans ses narines le souffle de vie, et l’homme devint un être vivant. Le Seigneur Dieu planta un jardin en Éden, à l’orient, et y plaça l’homme qu’il avait modelé. Le Seigneur Dieu fit pousser du sol toutes sortes d’arbres à l’aspect désirable et aux fruits savoureux; il y avait aussi l’arbre de vie au milieu du jardin, et l’arbre de la connaissance du bien et du mal.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            6,
            'Lorsque le Seigneur Dieu fit la terre et le ciel, aucun buisson n’était encore sur la terre, aucune herbe n’avait poussé, parce que le Seigneur Dieu n’avait pas encore fait pleuvoir sur la terre, et il n’y avait pas d’homme pour travailler le sol. Mais une source montait de la terre et irriguait toute la surface du sol. Alors le Seigneur Dieu modela l’homme avec la poussière tirée du sol; il insuffla dans ses narines le souffle de vie, et l’homme devint un être vivant. Le Seigneur Dieu planta un jardin en Éden, à l’orient, et y plaça l’homme qu’il avait modelé. Le Seigneur Dieu fit pousser du sol toutes sortes d’arbres à l’aspect désirable et aux fruits savoureux; il y avait aussi l’arbre de vie au milieu du jardin, et l’arbre de la connaissance du bien et du mal.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            7,
            'Lorsque le Seigneur Dieu fit la terre et le ciel, aucun buisson n’était encore sur la terre, aucune herbe n’avait poussé, parce que le Seigneur Dieu n’avait pas encore fait pleuvoir sur la terre, et il n’y avait pas d’homme pour travailler le sol. Mais une source montait de la terre et irriguait toute la surface du sol. Alors le Seigneur Dieu modela l’homme avec la poussière tirée du sol; il insuffla dans ses narines le souffle de vie, et l’homme devint un être vivant. Le Seigneur Dieu planta un jardin en Éden, à l’orient, et y plaça l’homme qu’il avait modelé. Le Seigneur Dieu fit pousser du sol toutes sortes d’arbres à l’aspect désirable et aux fruits savoureux; il y avait aussi l’arbre de vie au milieu du jardin, et l’arbre de la connaissance du bien et du mal.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            8,
            'Lorsque le Seigneur Dieu fit la terre et le ciel, aucun buisson n’était encore sur la terre, aucune herbe n’avait poussé, parce que le Seigneur Dieu n’avait pas encore fait pleuvoir sur la terre, et il n’y avait pas d’homme pour travailler le sol. Mais une source montait de la terre et irriguait toute la surface du sol. Alors le Seigneur Dieu modela l’homme avec la poussière tirée du sol; il insuffla dans ses narines le souffle de vie, et l’homme devint un être vivant. Le Seigneur Dieu planta un jardin en Éden, à l’orient, et y plaça l’homme qu’il avait modelé. Le Seigneur Dieu fit pousser du sol toutes sortes d’arbres à l’aspect désirable et aux fruits savoureux; il y avait aussi l’arbre de vie au milieu du jardin, et l’arbre de la connaissance du bien et du mal.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            9,
            'Lorsque le Seigneur Dieu fit la terre et le ciel, aucun buisson n’était encore sur la terre, aucune herbe n’avait poussé, parce que le Seigneur Dieu n’avait pas encore fait pleuvoir sur la terre, et il n’y avait pas d’homme pour travailler le sol. Mais une source montait de la terre et irriguait toute la surface du sol. Alors le Seigneur Dieu modela l’homme avec la poussière tirée du sol; il insuffla dans ses narines le souffle de vie, et l’homme devint un être vivant. Le Seigneur Dieu planta un jardin en Éden, à l’orient, et y plaça l’homme qu’il avait modelé. Le Seigneur Dieu fit pousser du sol toutes sortes d’arbres à l’aspect désirable et aux fruits savoureux; il y avait aussi l’arbre de vie au milieu du jardin, et l’arbre de la connaissance du bien et du mal.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            10,
            'Un fleuve sortait d’Éden pour irriguer le jardin; puis il se divisait en quatre bras: le premier s’appelle le Pishone, il contourne tout le pays de Havila où l’on trouve de l’or – et l’or de ce pays est bon – ainsi que de l’ambre jaune et de la cornaline; le deuxième fleuve s’appelle le Guihone, il contourne tout le pays de Koush; le troisième fleuve s’appelle le Tigre, il coule à l’est d’Assour; le quatrième fleuve est l’Euphrate.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            11,
            'Un fleuve sortait d’Éden pour irriguer le jardin; puis il se divisait en quatre bras: le premier s’appelle le Pishone, il contourne tout le pays de Havila où l’on trouve de l’or – et l’or de ce pays est bon – ainsi que de l’ambre jaune et de la cornaline; le deuxième fleuve s’appelle le Guihone, il contourne tout le pays de Koush; le troisième fleuve s’appelle le Tigre, il coule à l’est d’Assour; le quatrième fleuve est l’Euphrate.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            12,
            'Un fleuve sortait d’Éden pour irriguer le jardin; puis il se divisait en quatre bras: le premier s’appelle le Pishone, il contourne tout le pays de Havila où l’on trouve de l’or – et l’or de ce pays est bon – ainsi que de l’ambre jaune et de la cornaline; le deuxième fleuve s’appelle le Guihone, il contourne tout le pays de Koush; le troisième fleuve s’appelle le Tigre, il coule à l’est d’Assour; le quatrième fleuve est l’Euphrate.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            13,
            'Un fleuve sortait d’Éden pour irriguer le jardin; puis il se divisait en quatre bras: le premier s’appelle le Pishone, il contourne tout le pays de Havila où l’on trouve de l’or – et l’or de ce pays est bon – ainsi que de l’ambre jaune et de la cornaline; le deuxième fleuve s’appelle le Guihone, il contourne tout le pays de Koush; le troisième fleuve s’appelle le Tigre, il coule à l’est d’Assour; le quatrième fleuve est l’Euphrate.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            14,
            'Un fleuve sortait d’Éden pour irriguer le jardin; puis il se divisait en quatre bras: le premier s’appelle le Pishone, il contourne tout le pays de Havila où l’on trouve de l’or – et l’or de ce pays est bon – ainsi que de l’ambre jaune et de la cornaline; le deuxième fleuve s’appelle le Guihone, il contourne tout le pays de Koush; le troisième fleuve s’appelle le Tigre, il coule à l’est d’Assour; le quatrième fleuve est l’Euphrate.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            15,
            'Le Seigneur Dieu prit l’homme et le conduisit dans le jardin d’Éden pour qu’il le travaille et le garde. Le Seigneur Dieu donna à l’homme cet ordre: «Tu peux manger les fruits de tous les arbres du jardin; mais l’arbre de la connaissance du bien et du mal, tu n’en mangeras pas; car, le jour où tu en mangeras, tu mourras.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            16,
            'Le Seigneur Dieu prit l’homme et le conduisit dans le jardin d’Éden pour qu’il le travaille et le garde. Le Seigneur Dieu donna à l’homme cet ordre: «Tu peux manger les fruits de tous les arbres du jardin; mais l’arbre de la connaissance du bien et du mal, tu n’en mangeras pas; car, le jour où tu en mangeras, tu mourras.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            17,
            'Le Seigneur Dieu prit l’homme et le conduisit dans le jardin d’Éden pour qu’il le travaille et le garde. Le Seigneur Dieu donna à l’homme cet ordre: «Tu peux manger les fruits de tous les arbres du jardin; mais l’arbre de la connaissance du bien et du mal, tu n’en mangeras pas; car, le jour où tu en mangeras, tu mourras.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            18,
            'Le Seigneur Dieu dit: «Il n’est pas bon que l’homme soit seul. Je vais lui faire une aide qui lui correspondra.» Avec de la terre, le Seigneur Dieu modela toutes les bêtes des champs et tous les oiseaux du ciel, et il les amena vers l’homme pour voir quels noms il leur donnerait. C’étaient des êtres vivants, et l’homme donna un nom à chacun. L’homme donna donc leurs noms à tous les animaux, aux oiseaux du ciel et à toutes les bêtes des champs. Mais il ne trouva aucune aide qui lui corresponde. Alors le Seigneur Dieu fit tomber sur lui un sommeil mystérieux, et l’homme s’endormit. Le Seigneur Dieu prit une de ses côtes, puis il referma la chair à sa place. Avec la côte qu’il avait prise à l’homme, il façonna une femme et il l’amena vers l’homme.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            19,
            'Le Seigneur Dieu dit: «Il n’est pas bon que l’homme soit seul. Je vais lui faire une aide qui lui correspondra.» Avec de la terre, le Seigneur Dieu modela toutes les bêtes des champs et tous les oiseaux du ciel, et il les amena vers l’homme pour voir quels noms il leur donnerait. C’étaient des êtres vivants, et l’homme donna un nom à chacun. L’homme donna donc leurs noms à tous les animaux, aux oiseaux du ciel et à toutes les bêtes des champs. Mais il ne trouva aucune aide qui lui corresponde. Alors le Seigneur Dieu fit tomber sur lui un sommeil mystérieux, et l’homme s’endormit. Le Seigneur Dieu prit une de ses côtes, puis il referma la chair à sa place. Avec la côte qu’il avait prise à l’homme, il façonna une femme et il l’amena vers l’homme.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            20,
            'Le Seigneur Dieu dit: «Il n’est pas bon que l’homme soit seul. Je vais lui faire une aide qui lui correspondra.» Avec de la terre, le Seigneur Dieu modela toutes les bêtes des champs et tous les oiseaux du ciel, et il les amena vers l’homme pour voir quels noms il leur donnerait. C’étaient des êtres vivants, et l’homme donna un nom à chacun. L’homme donna donc leurs noms à tous les animaux, aux oiseaux du ciel et à toutes les bêtes des champs. Mais il ne trouva aucune aide qui lui corresponde. Alors le Seigneur Dieu fit tomber sur lui un sommeil mystérieux, et l’homme s’endormit. Le Seigneur Dieu prit une de ses côtes, puis il referma la chair à sa place. Avec la côte qu’il avait prise à l’homme, il façonna une femme et il l’amena vers l’homme.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            21,
            'Le Seigneur Dieu dit: «Il n’est pas bon que l’homme soit seul. Je vais lui faire une aide qui lui correspondra.» Avec de la terre, le Seigneur Dieu modela toutes les bêtes des champs et tous les oiseaux du ciel, et il les amena vers l’homme pour voir quels noms il leur donnerait. C’étaient des êtres vivants, et l’homme donna un nom à chacun. L’homme donna donc leurs noms à tous les animaux, aux oiseaux du ciel et à toutes les bêtes des champs. Mais il ne trouva aucune aide qui lui corresponde. Alors le Seigneur Dieu fit tomber sur lui un sommeil mystérieux, et l’homme s’endormit. Le Seigneur Dieu prit une de ses côtes, puis il referma la chair à sa place. Avec la côte qu’il avait prise à l’homme, il façonna une femme et il l’amena vers l’homme.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            22,
            'Le Seigneur Dieu dit: «Il n’est pas bon que l’homme soit seul. Je vais lui faire une aide qui lui correspondra.» Avec de la terre, le Seigneur Dieu modela toutes les bêtes des champs et tous les oiseaux du ciel, et il les amena vers l’homme pour voir quels noms il leur donnerait. C’étaient des êtres vivants, et l’homme donna un nom à chacun. L’homme donna donc leurs noms à tous les animaux, aux oiseaux du ciel et à toutes les bêtes des champs. Mais il ne trouva aucune aide qui lui corresponde. Alors le Seigneur Dieu fit tomber sur lui un sommeil mystérieux, et l’homme s’endormit. Le Seigneur Dieu prit une de ses côtes, puis il referma la chair à sa place. Avec la côte qu’il avait prise à l’homme, il façonna une femme et il l’amena vers l’homme.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            23,
            'L’homme dit alors: «Cette fois-ci, voilà l’os de mes os et la chair de ma chair! On l’appellera femme – Ishsha –, elle qui fut tirée de l’homme – Ish.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            24,
            'À cause de cela, l’homme quittera son père et sa mère, il s’attachera à sa femme, et tous deux ne feront plus qu’un.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            25,
            'Tous les deux, l’homme et sa femme, étaient nus, et ils n’en éprouvaient aucune honte l’un devant l’autre.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            26,
            'Adam s’unit encore à sa femme, et elle mit au monde un fils. Elle lui donna le nom de Seth (ce qui veut dire: accordé), car elle dit: «Dieu m’a accordé une nouvelle descendance à la place d’Abel, tué par Caïn.» 26Seth, lui aussi, eut un fils. Il l’appela du nom d’Énosh. Alors on commença à invoquer le nom du Seigneur.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            27,
            'Mathusalem vécut cent quatre-vingt-sept ans, puis il engendra Lamek. Après avoir engendré Lamek, Mathusalem vécut encore sept cent quatre-vingt-deux ans et engendra des fils et des filles. 27Mathusalem vécut en tout neuf cent soixante-neuf ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            28,
            'Lamek vécut cent quatre-vingt-deux ans, puis il engendra un fils. Il l’appela du nom de Noé, en disant: «Celui-ci nous soulagera de nos labeurs et de la peine qu’impose à nos mains un sol maudit par le Seigneur.» Après avoir engendré Noé, Lamek vécut encore cinq cent quatre-vingt-quinze ans et engendra des fils et des filles. Lamek vécut en tout sept cent soixante-dix-sept ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            29,
            'Lamek vécut cent quatre-vingt-deux ans, puis il engendra un fils. 29Il l’appela du nom de Noé, en disant: «Celui-ci nous soulagera de nos labeurs et de la peine qu’impose à nos mains un sol maudit par le Seigneur.» Après avoir engendré Noé, Lamek vécut encore cinq cent quatre-vingt-quinze ans et engendra des fils et des filles. Lamek vécut en tout sept cent soixante-dix-sept ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            30,
            'Lamek vécut cent quatre-vingt-deux ans, puis il engendra un fils. Il l’appela du nom de Noé, en disant: «Celui-ci nous soulagera de nos labeurs et de la peine qu’impose à nos mains un sol maudit par le Seigneur.» 30Après avoir engendré Noé, Lamek vécut encore cinq cent quatre-vingt-quinze ans et engendra des fils et des filles. Lamek vécut en tout sept cent soixante-dix-sept ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 2),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            31,
            'Lamek vécut cent quatre-vingt-deux ans, puis il engendra un fils. Il l’appela du nom de Noé, en disant: «Celui-ci nous soulagera de nos labeurs et de la peine qu’impose à nos mains un sol maudit par le Seigneur.» Après avoir engendré Noé, Lamek vécut encore cinq cent quatre-vingt-quinze ans et engendra des fils et des filles. 31Lamek vécut en tout sept cent soixante-dix-sept ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

    INSERT INTO "chapters" ("bookID", "number") VALUES
    ('GEN', 3)
    ON CONFLICT ("bookID", "number") DO NOTHING;
    

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            1,
            'Le serpent était le plus rusé de tous les animaux des champs que le Seigneur Dieu avait faits. Il dit à la femme: «Alors, Dieu vous a vraiment dit: “Vous ne mangerez d’aucun arbre du jardin”?» La femme répondit au serpent: «Nous mangeons les fruits des arbres du jardin. Mais, pour le fruit de l’arbre qui est au milieu du jardin, Dieu a dit: “Vous n’en mangerez pas, vous n’y toucherez pas, sinon vous mourrez.”» Le serpent dit à la femme: «Pas du tout! Vous ne mourrez pas! Mais Dieu sait que, le jour où vous en mangerez, vos yeux s’ouvriront, et vous serez comme des dieux, connaissant le bien et le mal.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            2,
            'Le serpent était le plus rusé de tous les animaux des champs que le Seigneur Dieu avait faits. Il dit à la femme: «Alors, Dieu vous a vraiment dit: “Vous ne mangerez d’aucun arbre du jardin”?» La femme répondit au serpent: «Nous mangeons les fruits des arbres du jardin. Mais, pour le fruit de l’arbre qui est au milieu du jardin, Dieu a dit: “Vous n’en mangerez pas, vous n’y toucherez pas, sinon vous mourrez.”» Le serpent dit à la femme: «Pas du tout! Vous ne mourrez pas! Mais Dieu sait que, le jour où vous en mangerez, vos yeux s’ouvriront, et vous serez comme des dieux, connaissant le bien et le mal.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            3,
            'Le serpent était le plus rusé de tous les animaux des champs que le Seigneur Dieu avait faits. Il dit à la femme: «Alors, Dieu vous a vraiment dit: “Vous ne mangerez d’aucun arbre du jardin”?» La femme répondit au serpent: «Nous mangeons les fruits des arbres du jardin. Mais, pour le fruit de l’arbre qui est au milieu du jardin, Dieu a dit: “Vous n’en mangerez pas, vous n’y toucherez pas, sinon vous mourrez.”» Le serpent dit à la femme: «Pas du tout! Vous ne mourrez pas! Mais Dieu sait que, le jour où vous en mangerez, vos yeux s’ouvriront, et vous serez comme des dieux, connaissant le bien et le mal.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            4,
            'Le serpent était le plus rusé de tous les animaux des champs que le Seigneur Dieu avait faits. Il dit à la femme: «Alors, Dieu vous a vraiment dit: “Vous ne mangerez d’aucun arbre du jardin”?» La femme répondit au serpent: «Nous mangeons les fruits des arbres du jardin. Mais, pour le fruit de l’arbre qui est au milieu du jardin, Dieu a dit: “Vous n’en mangerez pas, vous n’y toucherez pas, sinon vous mourrez.”» Le serpent dit à la femme: «Pas du tout! Vous ne mourrez pas! Mais Dieu sait que, le jour où vous en mangerez, vos yeux s’ouvriront, et vous serez comme des dieux, connaissant le bien et le mal.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            5,
            'Le serpent était le plus rusé de tous les animaux des champs que le Seigneur Dieu avait faits. Il dit à la femme: «Alors, Dieu vous a vraiment dit: “Vous ne mangerez d’aucun arbre du jardin”?» La femme répondit au serpent: «Nous mangeons les fruits des arbres du jardin. Mais, pour le fruit de l’arbre qui est au milieu du jardin, Dieu a dit: “Vous n’en mangerez pas, vous n’y toucherez pas, sinon vous mourrez.”» Le serpent dit à la femme: «Pas du tout! Vous ne mourrez pas! Mais Dieu sait que, le jour où vous en mangerez, vos yeux s’ouvriront, et vous serez comme des dieux, connaissant le bien et le mal.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            6,
            'La femme s’aperçut que le fruit de l’arbre devait être savoureux, qu’il était agréable à regarder et qu’il était désirable, cet arbre, puisqu’il donnait l’intelligence. Elle prit de son fruit, et en mangea. Elle en donna aussi à son mari, et il en mangea. Alors leurs yeux à tous deux s’ouvrirent et ils se rendirent compte qu’ils étaient nus. Ils attachèrent les unes aux autres des feuilles de figuier, et ils s’en firent des pagnes.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            7,
            'La femme s’aperçut que le fruit de l’arbre devait être savoureux, qu’il était agréable à regarder et qu’il était désirable, cet arbre, puisqu’il donnait l’intelligence. Elle prit de son fruit, et en mangea. Elle en donna aussi à son mari, et il en mangea. Alors leurs yeux à tous deux s’ouvrirent et ils se rendirent compte qu’ils étaient nus. Ils attachèrent les unes aux autres des feuilles de figuier, et ils s’en firent des pagnes.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            8,
            'Ils entendirent la voix du Seigneur Dieu qui se promenait dans le jardin à la brise du jour. L’homme et sa femme allèrent se cacher aux regards du Seigneur Dieu parmi les arbres du jardin. Le Seigneur Dieu appela l’homme et lui dit: «Où es-tu donc?» Il répondit: «J’ai entendu ta voix dans le jardin, j’ai pris peur parce que je suis nu, et je me suis caché.» Le Seigneur reprit: «Qui donc t’a dit que tu étais nu? Aurais-tu mangé de l’arbre dont je t’avais interdit de manger?» L’homme répondit: «La femme que tu m’as donnée, c’est elle qui m’a donné du fruit de l’arbre, et j’en ai mangé.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            9,
            'Ils entendirent la voix du Seigneur Dieu qui se promenait dans le jardin à la brise du jour. L’homme et sa femme allèrent se cacher aux regards du Seigneur Dieu parmi les arbres du jardin. Le Seigneur Dieu appela l’homme et lui dit: «Où es-tu donc?» Il répondit: «J’ai entendu ta voix dans le jardin, j’ai pris peur parce que je suis nu, et je me suis caché.» Le Seigneur reprit: «Qui donc t’a dit que tu étais nu? Aurais-tu mangé de l’arbre dont je t’avais interdit de manger?» L’homme répondit: «La femme que tu m’as donnée, c’est elle qui m’a donné du fruit de l’arbre, et j’en ai mangé.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            10,
            'Ils entendirent la voix du Seigneur Dieu qui se promenait dans le jardin à la brise du jour. L’homme et sa femme allèrent se cacher aux regards du Seigneur Dieu parmi les arbres du jardin. Le Seigneur Dieu appela l’homme et lui dit: «Où es-tu donc?» Il répondit: «J’ai entendu ta voix dans le jardin, j’ai pris peur parce que je suis nu, et je me suis caché.» Le Seigneur reprit: «Qui donc t’a dit que tu étais nu? Aurais-tu mangé de l’arbre dont je t’avais interdit de manger?» L’homme répondit: «La femme que tu m’as donnée, c’est elle qui m’a donné du fruit de l’arbre, et j’en ai mangé.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            11,
            'Ils entendirent la voix du Seigneur Dieu qui se promenait dans le jardin à la brise du jour. L’homme et sa femme allèrent se cacher aux regards du Seigneur Dieu parmi les arbres du jardin. Le Seigneur Dieu appela l’homme et lui dit: «Où es-tu donc?» Il répondit: «J’ai entendu ta voix dans le jardin, j’ai pris peur parce que je suis nu, et je me suis caché.» Le Seigneur reprit: «Qui donc t’a dit que tu étais nu? Aurais-tu mangé de l’arbre dont je t’avais interdit de manger?» L’homme répondit: «La femme que tu m’as donnée, c’est elle qui m’a donné du fruit de l’arbre, et j’en ai mangé.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            12,
            'Ils entendirent la voix du Seigneur Dieu qui se promenait dans le jardin à la brise du jour. L’homme et sa femme allèrent se cacher aux regards du Seigneur Dieu parmi les arbres du jardin. Le Seigneur Dieu appela l’homme et lui dit: «Où es-tu donc?» Il répondit: «J’ai entendu ta voix dans le jardin, j’ai pris peur parce que je suis nu, et je me suis caché.» Le Seigneur reprit: «Qui donc t’a dit que tu étais nu? Aurais-tu mangé de l’arbre dont je t’avais interdit de manger?» L’homme répondit: «La femme que tu m’as donnée, c’est elle qui m’a donné du fruit de l’arbre, et j’en ai mangé.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            13,
            'Le Seigneur Dieu dit à la femme: «Qu’as-tu fait là?» La femme répondit: «Le serpent m’a trompée, et j’ai mangé.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            14,
            'Alors le Seigneur Dieu dit au serpent: «Parce que tu as fait cela, tu seras maudit parmi tous les animaux et toutes les bêtes des champs. Tu ramperas sur le ventre et tu mangeras de la poussière tous les jours de ta vie. Je mettrai une hostilité entre toi et la femme, entre ta descendance et sa descendance: celle-ci te meurtrira la tête, et toi, tu lui meurtriras le talon.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            15,
            'Alors le Seigneur Dieu dit au serpent: «Parce que tu as fait cela, tu seras maudit parmi tous les animaux et toutes les bêtes des champs. Tu ramperas sur le ventre et tu mangeras de la poussière tous les jours de ta vie. Je mettrai une hostilité entre toi et la femme, entre ta descendance et sa descendance: celle-ci te meurtrira la tête, et toi, tu lui meurtriras le talon.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            16,
            'Le Seigneur Dieu dit ensuite à la femme: «Je multiplierai la peine de tes grossesses; c’est dans la peine que tu enfanteras des fils. Ton désir te portera vers ton mari, et celui-ci dominera sur toi.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            17,
            'Il dit enfin à l’homme: «Parce que tu as écouté la voix de ta femme, et que tu as mangé le fruit de l’arbre que je t’avais interdit de manger: maudit soit le sol à cause de toi! C’est dans la peine que tu en tireras ta nourriture, tous les jours de ta vie. De lui-même, il te donnera épines et chardons, mais tu auras ta nourriture en cultivant les champs. C’est à la sueur de ton visage que tu gagneras ton pain, jusqu’à ce que tu retournes à la terre dont tu proviens; car tu es poussière, et à la poussière tu retourneras.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            18,
            'Il dit enfin à l’homme: «Parce que tu as écouté la voix de ta femme, et que tu as mangé le fruit de l’arbre que je t’avais interdit de manger: maudit soit le sol à cause de toi! C’est dans la peine que tu en tireras ta nourriture, tous les jours de ta vie. De lui-même, il te donnera épines et chardons, mais tu auras ta nourriture en cultivant les champs. C’est à la sueur de ton visage que tu gagneras ton pain, jusqu’à ce que tu retournes à la terre dont tu proviens; car tu es poussière, et à la poussière tu retourneras.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            19,
            'Il dit enfin à l’homme: «Parce que tu as écouté la voix de ta femme, et que tu as mangé le fruit de l’arbre que je t’avais interdit de manger: maudit soit le sol à cause de toi! C’est dans la peine que tu en tireras ta nourriture, tous les jours de ta vie. De lui-même, il te donnera épines et chardons, mais tu auras ta nourriture en cultivant les champs. C’est à la sueur de ton visage que tu gagneras ton pain, jusqu’à ce que tu retournes à la terre dont tu proviens; car tu es poussière, et à la poussière tu retourneras.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            20,
            'L’homme appela sa femme Ève (c’est-à-dire: la vivante), parce qu’elle fut la mère de tous les vivants. Le Seigneur Dieu fit à l’homme et à sa femme des tuniques de peau et les en revêtit. Puis le Seigneur Dieu déclara: «Voilà que l’homme est devenu comme l’un de nous par la connaissance du bien et du mal! Maintenant, ne permettons pas qu’il avance la main, qu’il cueille aussi le fruit de l’arbre de vie, qu’il en mange et vive éternellement!»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            21,
            'L’homme appela sa femme Ève (c’est-à-dire: la vivante), parce qu’elle fut la mère de tous les vivants. Le Seigneur Dieu fit à l’homme et à sa femme des tuniques de peau et les en revêtit. Puis le Seigneur Dieu déclara: «Voilà que l’homme est devenu comme l’un de nous par la connaissance du bien et du mal! Maintenant, ne permettons pas qu’il avance la main, qu’il cueille aussi le fruit de l’arbre de vie, qu’il en mange et vive éternellement!»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            22,
            'L’homme appela sa femme Ève (c’est-à-dire: la vivante), parce qu’elle fut la mère de tous les vivants. Le Seigneur Dieu fit à l’homme et à sa femme des tuniques de peau et les en revêtit. Puis le Seigneur Dieu déclara: «Voilà que l’homme est devenu comme l’un de nous par la connaissance du bien et du mal! Maintenant, ne permettons pas qu’il avance la main, qu’il cueille aussi le fruit de l’arbre de vie, qu’il en mange et vive éternellement!»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            23,
            'Alors le Seigneur Dieu le renvoya du jardin d’Éden, pour qu’il travaille la terre d’où il avait été tiré. Il expulsa l’homme, et il posta, à l’orient du jardin d’Éden, les Kéroubim, armés d’un glaive fulgurant, pour garder l’accès de l’arbre de vie.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            24,
            'Alors le Seigneur Dieu le renvoya du jardin d’Éden, pour qu’il travaille la terre d’où il avait été tiré. Il expulsa l’homme, et il posta, à l’orient du jardin d’Éden, les Kéroubim, armés d’un glaive fulgurant, pour garder l’accès de l’arbre de vie.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            25,
            'Adam s’unit encore à sa femme, et elle mit au monde un fils. Elle lui donna le nom de Seth (ce qui veut dire: accordé), car elle dit: «Dieu m’a accordé une nouvelle descendance à la place d’Abel, tué par Caïn.» Seth, lui aussi, eut un fils. Il l’appela du nom d’Énosh. Alors on commença à invoquer le nom du Seigneur.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            26,
            'Adam s’unit encore à sa femme, et elle mit au monde un fils. Elle lui donna le nom de Seth (ce qui veut dire: accordé), car elle dit: «Dieu m’a accordé une nouvelle descendance à la place d’Abel, tué par Caïn.» 26Seth, lui aussi, eut un fils. Il l’appela du nom d’Énosh. Alors on commença à invoquer le nom du Seigneur.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            27,
            'Mathusalem vécut cent quatre-vingt-sept ans, puis il engendra Lamek. Après avoir engendré Lamek, Mathusalem vécut encore sept cent quatre-vingt-deux ans et engendra des fils et des filles. 27Mathusalem vécut en tout neuf cent soixante-neuf ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            28,
            'Lamek vécut cent quatre-vingt-deux ans, puis il engendra un fils. Il l’appela du nom de Noé, en disant: «Celui-ci nous soulagera de nos labeurs et de la peine qu’impose à nos mains un sol maudit par le Seigneur.» Après avoir engendré Noé, Lamek vécut encore cinq cent quatre-vingt-quinze ans et engendra des fils et des filles. Lamek vécut en tout sept cent soixante-dix-sept ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            29,
            'Lamek vécut cent quatre-vingt-deux ans, puis il engendra un fils. 29Il l’appela du nom de Noé, en disant: «Celui-ci nous soulagera de nos labeurs et de la peine qu’impose à nos mains un sol maudit par le Seigneur.» Après avoir engendré Noé, Lamek vécut encore cinq cent quatre-vingt-quinze ans et engendra des fils et des filles. Lamek vécut en tout sept cent soixante-dix-sept ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            30,
            'Lamek vécut cent quatre-vingt-deux ans, puis il engendra un fils. Il l’appela du nom de Noé, en disant: «Celui-ci nous soulagera de nos labeurs et de la peine qu’impose à nos mains un sol maudit par le Seigneur.» 30Après avoir engendré Noé, Lamek vécut encore cinq cent quatre-vingt-quinze ans et engendra des fils et des filles. Lamek vécut en tout sept cent soixante-dix-sept ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 3),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            31,
            'Lamek vécut cent quatre-vingt-deux ans, puis il engendra un fils. Il l’appela du nom de Noé, en disant: «Celui-ci nous soulagera de nos labeurs et de la peine qu’impose à nos mains un sol maudit par le Seigneur.» Après avoir engendré Noé, Lamek vécut encore cinq cent quatre-vingt-quinze ans et engendra des fils et des filles. 31Lamek vécut en tout sept cent soixante-dix-sept ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

    INSERT INTO "chapters" ("bookID", "number") VALUES
    ('GEN', 4)
    ON CONFLICT ("bookID", "number") DO NOTHING;
    

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            1,
            'L’homme s’unit à Ève, sa femme: elle devint enceinte, et elle mit au monde Caïn. Elle dit alors: «J’ai acquis un homme avec l’aide du Seigneur!» Dans la suite, elle mit au monde Abel, frère de Caïn. Abel devint berger, et Caïn cultivait la terre.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            2,
            'L’homme s’unit à Ève, sa femme: elle devint enceinte, et elle mit au monde Caïn. Elle dit alors: «J’ai acquis un homme avec l’aide du Seigneur!» Dans la suite, elle mit au monde Abel, frère de Caïn. Abel devint berger, et Caïn cultivait la terre.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            3,
            'Au temps fixé, Caïn présenta des produits de la terre en offrande au Seigneur. De son côté, Abel présenta les premiers-nés de son troupeau, en offrant les morceaux les meilleurs. Le Seigneur tourna son regard vers Abel et son offrande, mais vers Caïn et son offrande, il ne le tourna pas.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            4,
            'Au temps fixé, Caïn présenta des produits de la terre en offrande au Seigneur. De son côté, Abel présenta les premiers-nés de son troupeau, en offrant les morceaux les meilleurs. Le Seigneur tourna son regard vers Abel et son offrande, mais vers Caïn et son offrande, il ne le tourna pas.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            5,
            'Au temps fixé, Caïn présenta des produits de la terre en offrande au Seigneur. De son côté, Abel présenta les premiers-nés de son troupeau, en offrant les morceaux les meilleurs. Le Seigneur tourna son regard vers Abel et son offrande, mais vers Caïn et son offrande, il ne le tourna pas.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            6,
            'Caïn en fut très irrité et montra un visage abattu. Le Seigneur dit à Caïn: «Pourquoi es-tu irrité, pourquoi ce visage abattu? Si tu agis bien, ne relèveras-tu pas ton visage? Mais si tu n’agis pas bien…, le péché est accroupi à ta porte. Il est à l’affût, mais tu dois le dominer.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            7,
            'Caïn en fut très irrité et montra un visage abattu. Le Seigneur dit à Caïn: «Pourquoi es-tu irrité, pourquoi ce visage abattu? Si tu agis bien, ne relèveras-tu pas ton visage? Mais si tu n’agis pas bien…, le péché est accroupi à ta porte. Il est à l’affût, mais tu dois le dominer.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            8,
            'Caïn dit à son frère Abel: «Sortons dans les champs.» Et, quand ils furent dans la campagne, Caïn se jeta sur son frère Abel et le tua.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            9,
            'Le Seigneur dit à Caïn: «Où est ton frère Abel?» Caïn répondit: «Je ne sais pas. Est-ce que je suis, moi, le gardien de mon frère?» Le Seigneur reprit: «Qu’as-tu fait? La voix du sang de ton frère crie de la terre vers moi! Maintenant donc, sois maudit et chassé loin de cette terre qui a ouvert la bouche pour boire le sang de ton frère, versé par ta main. Tu auras beau cultiver la terre, elle ne produira plus rien pour toi. Tu seras un errant, un vagabond sur la terre.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            10,
            'Le Seigneur dit à Caïn: «Où est ton frère Abel?» Caïn répondit: «Je ne sais pas. Est-ce que je suis, moi, le gardien de mon frère?» Le Seigneur reprit: «Qu’as-tu fait? La voix du sang de ton frère crie de la terre vers moi! Maintenant donc, sois maudit et chassé loin de cette terre qui a ouvert la bouche pour boire le sang de ton frère, versé par ta main. Tu auras beau cultiver la terre, elle ne produira plus rien pour toi. Tu seras un errant, un vagabond sur la terre.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            11,
            'Le Seigneur dit à Caïn: «Où est ton frère Abel?» Caïn répondit: «Je ne sais pas. Est-ce que je suis, moi, le gardien de mon frère?» Le Seigneur reprit: «Qu’as-tu fait? La voix du sang de ton frère crie de la terre vers moi! Maintenant donc, sois maudit et chassé loin de cette terre qui a ouvert la bouche pour boire le sang de ton frère, versé par ta main. Tu auras beau cultiver la terre, elle ne produira plus rien pour toi. Tu seras un errant, un vagabond sur la terre.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            12,
            'Le Seigneur dit à Caïn: «Où est ton frère Abel?» Caïn répondit: «Je ne sais pas. Est-ce que je suis, moi, le gardien de mon frère?» Le Seigneur reprit: «Qu’as-tu fait? La voix du sang de ton frère crie de la terre vers moi! Maintenant donc, sois maudit et chassé loin de cette terre qui a ouvert la bouche pour boire le sang de ton frère, versé par ta main. Tu auras beau cultiver la terre, elle ne produira plus rien pour toi. Tu seras un errant, un vagabond sur la terre.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            13,
            'Alors Caïn dit au Seigneur: «Mon châtiment est trop lourd à porter! Voici qu’aujourd’hui tu m’as chassé de cette terre. Je dois me cacher loin de toi, je serai un errant, un vagabond sur la terre, et le premier venu qui me trouvera me tuera.» Le Seigneur lui répondit: «Si quelqu’un tue Caïn, Caïn sera vengé sept fois.» Et le Seigneur mit un signe sur Caïn pour le préserver d’être tué par le premier venu qui le trouverait.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            14,
            'Alors Caïn dit au Seigneur: «Mon châtiment est trop lourd à porter! Voici qu’aujourd’hui tu m’as chassé de cette terre. Je dois me cacher loin de toi, je serai un errant, un vagabond sur la terre, et le premier venu qui me trouvera me tuera.» Le Seigneur lui répondit: «Si quelqu’un tue Caïn, Caïn sera vengé sept fois.» Et le Seigneur mit un signe sur Caïn pour le préserver d’être tué par le premier venu qui le trouverait.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            15,
            'Alors Caïn dit au Seigneur: «Mon châtiment est trop lourd à porter! Voici qu’aujourd’hui tu m’as chassé de cette terre. Je dois me cacher loin de toi, je serai un errant, un vagabond sur la terre, et le premier venu qui me trouvera me tuera.» Le Seigneur lui répondit: «Si quelqu’un tue Caïn, Caïn sera vengé sept fois.» Et le Seigneur mit un signe sur Caïn pour le préserver d’être tué par le premier venu qui le trouverait.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            16,
            'Caïn s’éloigna de la face du Seigneur et s’en vint habiter au pays de Nod, à l’est d’Éden. Il s’unit à sa femme, elle devint enceinte et mit au monde Hénok. Il construisit une ville et l’appela du nom de son fils: Hénok. À Hénok naquit Irad, Irad engendra Mehouyaël, Mehouyaël engendra Metoushaël, et Metoushaël engendra Lamek.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            17,
            'Caïn s’éloigna de la face du Seigneur et s’en vint habiter au pays de Nod, à l’est d’Éden. Il s’unit à sa femme, elle devint enceinte et mit au monde Hénok. Il construisit une ville et l’appela du nom de son fils: Hénok. À Hénok naquit Irad, Irad engendra Mehouyaël, Mehouyaël engendra Metoushaël, et Metoushaël engendra Lamek.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            18,
            'Caïn s’éloigna de la face du Seigneur et s’en vint habiter au pays de Nod, à l’est d’Éden. Il s’unit à sa femme, elle devint enceinte et mit au monde Hénok. Il construisit une ville et l’appela du nom de son fils: Hénok. À Hénok naquit Irad, Irad engendra Mehouyaël, Mehouyaël engendra Metoushaël, et Metoushaël engendra Lamek.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            19,
            'Lamek prit deux femmes: l’une s’appelait Ada et l’autre, Silla.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            20,
            'Lamek prit deux femmes: l’une s’appelait Ada et l’autre, Silla.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            21,
            'Lamek prit deux femmes: l’une s’appelait Ada et l’autre, Silla.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            22,
            'Lamek prit deux femmes: l’une s’appelait Ada et l’autre, Silla.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            23,
            '«Ada et Silla, entendez ma voix, épouses de Lamek, écoutez ma parole: Pour une blessure, j’ai tué un homme; pour une meurtrissure, un enfant.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            24,
            'Caïn sera vengé sept fois, et Lamek, soixante-dix-sept fois!»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            25,
            'Adam s’unit encore à sa femme, et elle mit au monde un fils. Elle lui donna le nom de Seth (ce qui veut dire: accordé), car elle dit: «Dieu m’a accordé une nouvelle descendance à la place d’Abel, tué par Caïn.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            26,
            'Adam s’unit encore à sa femme, et elle mit au monde un fils. Elle lui donna le nom de Seth (ce qui veut dire: accordé), car elle dit: «Dieu m’a accordé une nouvelle descendance à la place d’Abel, tué par Caïn.»')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            27,
            'Mathusalem vécut cent quatre-vingt-sept ans, puis il engendra Lamek. Après avoir engendré Lamek, Mathusalem vécut encore sept cent quatre-vingt-deux ans et engendra des fils et des filles. 27Mathusalem vécut en tout neuf cent soixante-neuf ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            28,
            'Lamek vécut cent quatre-vingt-deux ans, puis il engendra un fils. Il l’appela du nom de Noé, en disant: «Celui-ci nous soulagera de nos labeurs et de la peine qu’impose à nos mains un sol maudit par le Seigneur.» Après avoir engendré Noé, Lamek vécut encore cinq cent quatre-vingt-quinze ans et engendra des fils et des filles. Lamek vécut en tout sept cent soixante-dix-sept ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            29,
            'Lamek vécut cent quatre-vingt-deux ans, puis il engendra un fils. 29Il l’appela du nom de Noé, en disant: «Celui-ci nous soulagera de nos labeurs et de la peine qu’impose à nos mains un sol maudit par le Seigneur.» Après avoir engendré Noé, Lamek vécut encore cinq cent quatre-vingt-quinze ans et engendra des fils et des filles. Lamek vécut en tout sept cent soixante-dix-sept ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            30,
            'Lamek vécut cent quatre-vingt-deux ans, puis il engendra un fils. Il l’appela du nom de Noé, en disant: «Celui-ci nous soulagera de nos labeurs et de la peine qu’impose à nos mains un sol maudit par le Seigneur.» 30Après avoir engendré Noé, Lamek vécut encore cinq cent quatre-vingt-quinze ans et engendra des fils et des filles. Lamek vécut en tout sept cent soixante-dix-sept ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 4),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            31,
            'Lamek vécut cent quatre-vingt-deux ans, puis il engendra un fils. Il l’appela du nom de Noé, en disant: «Celui-ci nous soulagera de nos labeurs et de la peine qu’impose à nos mains un sol maudit par le Seigneur.» Après avoir engendré Noé, Lamek vécut encore cinq cent quatre-vingt-quinze ans et engendra des fils et des filles. 31Lamek vécut en tout sept cent soixante-dix-sept ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

    INSERT INTO "chapters" ("bookID", "number") VALUES
    ('GEN', 5)
    ON CONFLICT ("bookID", "number") DO NOTHING;
    

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            1,
            'Voici le livre de la descendance d’Adam. Le jour où Dieu créa l’homme, il le fit à la ressemblance de Dieu; il les créa homme et femme; il les bénit et il leur donna le nom d’«Homme», le jour où ils furent créés.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            2,
            'Voici le livre de la descendance d’Adam. Le jour où Dieu créa l’homme, il le fit à la ressemblance de Dieu; il les créa homme et femme; il les bénit et il leur donna le nom d’«Homme», le jour où ils furent créés.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            3,
            'Adam vécut cent trente ans, puis il engendra un fils à sa ressemblance et selon son image; il l’appela du nom de Seth. Après qu’Adam eut engendré Seth, la durée de sa vie fut encore de huit cents ans, et il engendra des fils et des filles. Adam vécut en tout neuf cent trente ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            4,
            'Adam vécut cent trente ans, puis il engendra un fils à sa ressemblance et selon son image; il l’appela du nom de Seth. Après qu’Adam eut engendré Seth, la durée de sa vie fut encore de huit cents ans, et il engendra des fils et des filles. Adam vécut en tout neuf cent trente ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            5,
            'Adam vécut cent trente ans, puis il engendra un fils à sa ressemblance et selon son image; il l’appela du nom de Seth. Après qu’Adam eut engendré Seth, la durée de sa vie fut encore de huit cents ans, et il engendra des fils et des filles. Adam vécut en tout neuf cent trente ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            6,
            'Seth vécut cent cinq ans, puis il engendra Énosh. Après avoir engendré Énosh, Seth vécut encore huit cent sept ans et engendra des fils et des filles. Seth vécut en tout neuf cent douze ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            7,
            'Seth vécut cent cinq ans, puis il engendra Énosh. Après avoir engendré Énosh, Seth vécut encore huit cent sept ans et engendra des fils et des filles. Seth vécut en tout neuf cent douze ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            8,
            'Seth vécut cent cinq ans, puis il engendra Énosh. Après avoir engendré Énosh, Seth vécut encore huit cent sept ans et engendra des fils et des filles. Seth vécut en tout neuf cent douze ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            9,
            'Énosh vécut quatre-vingt-dix ans, puis il engendra Qénane. Après avoir engendré Qénane, Énosh vécut encore huit cent quinze ans et engendra des fils et des filles. Énosh vécut en tout neuf cent cinq ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            10,
            'Énosh vécut quatre-vingt-dix ans, puis il engendra Qénane. Après avoir engendré Qénane, Énosh vécut encore huit cent quinze ans et engendra des fils et des filles. Énosh vécut en tout neuf cent cinq ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            11,
            'Énosh vécut quatre-vingt-dix ans, puis il engendra Qénane. Après avoir engendré Qénane, Énosh vécut encore huit cent quinze ans et engendra des fils et des filles. Énosh vécut en tout neuf cent cinq ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            12,
            'Qénane vécut soixante-dix ans, puis il engendra Mahalalel. Après avoir engendré Mahalalel, Qénane vécut encore huit cent quarante ans et engendra des fils et des filles. Qénane vécut en tout neuf cent dix ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            13,
            'Qénane vécut soixante-dix ans, puis il engendra Mahalalel. Après avoir engendré Mahalalel, Qénane vécut encore huit cent quarante ans et engendra des fils et des filles. Qénane vécut en tout neuf cent dix ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            14,
            'Qénane vécut soixante-dix ans, puis il engendra Mahalalel. Après avoir engendré Mahalalel, Qénane vécut encore huit cent quarante ans et engendra des fils et des filles. Qénane vécut en tout neuf cent dix ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            15,
            'Mahalalel vécut soixante-cinq ans, puis il engendra Yèred. Après avoir engendré Yèred, Mahalalel vécut encore huit cent trente ans et engendra des fils et des filles. Mahalalel vécut en tout huit cent quatre-vingt-quinze ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            16,
            'Mahalalel vécut soixante-cinq ans, puis il engendra Yèred. Après avoir engendré Yèred, Mahalalel vécut encore huit cent trente ans et engendra des fils et des filles. Mahalalel vécut en tout huit cent quatre-vingt-quinze ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            17,
            'Mahalalel vécut soixante-cinq ans, puis il engendra Yèred. Après avoir engendré Yèred, Mahalalel vécut encore huit cent trente ans et engendra des fils et des filles. Mahalalel vécut en tout huit cent quatre-vingt-quinze ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            18,
            'Yèred vécut cent soixante-deux ans, puis il engendra Hénok. Après avoir engendré Hénok, Yèred vécut encore huit cents ans et engendra des fils et des filles. Yèred vécut en tout neuf cent soixante-deux ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            19,
            'Yèred vécut cent soixante-deux ans, puis il engendra Hénok. Après avoir engendré Hénok, Yèred vécut encore huit cents ans et engendra des fils et des filles. Yèred vécut en tout neuf cent soixante-deux ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            20,
            'Yèred vécut cent soixante-deux ans, puis il engendra Hénok. Après avoir engendré Hénok, Yèred vécut encore huit cents ans et engendra des fils et des filles. Yèred vécut en tout neuf cent soixante-deux ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            21,
            'Hénok vécut soixante-cinq ans, puis il engendra Mathusalem. Après avoir engendré Mathusalem, Hénok marcha encore avec Dieu pendant trois cents ans et engendra des fils et des filles. Hénok vécut en tout trois cent soixante-cinq ans. Il avait marché avec Dieu, puis il disparut car Dieu l’avait enlevé.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            22,
            'Hénok vécut soixante-cinq ans, puis il engendra Mathusalem. Après avoir engendré Mathusalem, Hénok marcha encore avec Dieu pendant trois cents ans et engendra des fils et des filles. Hénok vécut en tout trois cent soixante-cinq ans. Il avait marché avec Dieu, puis il disparut car Dieu l’avait enlevé.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            23,
            'Hénok vécut soixante-cinq ans, puis il engendra Mathusalem. Après avoir engendré Mathusalem, Hénok marcha encore avec Dieu pendant trois cents ans et engendra des fils et des filles. Hénok vécut en tout trois cent soixante-cinq ans. Il avait marché avec Dieu, puis il disparut car Dieu l’avait enlevé.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            24,
            'Hénok vécut soixante-cinq ans, puis il engendra Mathusalem. Après avoir engendré Mathusalem, Hénok marcha encore avec Dieu pendant trois cents ans et engendra des fils et des filles. Hénok vécut en tout trois cent soixante-cinq ans. Il avait marché avec Dieu, puis il disparut car Dieu l’avait enlevé.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            25,
            'Mathusalem vécut cent quatre-vingt-sept ans, puis il engendra Lamek. Après avoir engendré Lamek, Mathusalem vécut encore sept cent quatre-vingt-deux ans et engendra des fils et des filles. Mathusalem vécut en tout neuf cent soixante-neuf ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            26,
            'Mathusalem vécut cent quatre-vingt-sept ans, puis il engendra Lamek. Après avoir engendré Lamek, Mathusalem vécut encore sept cent quatre-vingt-deux ans et engendra des fils et des filles. Mathusalem vécut en tout neuf cent soixante-neuf ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            27,
            'Mathusalem vécut cent quatre-vingt-sept ans, puis il engendra Lamek. Après avoir engendré Lamek, Mathusalem vécut encore sept cent quatre-vingt-deux ans et engendra des fils et des filles. Mathusalem vécut en tout neuf cent soixante-neuf ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            28,
            'Lamek vécut cent quatre-vingt-deux ans, puis il engendra un fils. Il l’appela du nom de Noé, en disant: «Celui-ci nous soulagera de nos labeurs et de la peine qu’impose à nos mains un sol maudit par le Seigneur.» Après avoir engendré Noé, Lamek vécut encore cinq cent quatre-vingt-quinze ans et engendra des fils et des filles. Lamek vécut en tout sept cent soixante-dix-sept ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            29,
            'Lamek vécut cent quatre-vingt-deux ans, puis il engendra un fils. Il l’appela du nom de Noé, en disant: «Celui-ci nous soulagera de nos labeurs et de la peine qu’impose à nos mains un sol maudit par le Seigneur.» Après avoir engendré Noé, Lamek vécut encore cinq cent quatre-vingt-quinze ans et engendra des fils et des filles. Lamek vécut en tout sept cent soixante-dix-sept ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            30,
            'Lamek vécut cent quatre-vingt-deux ans, puis il engendra un fils. Il l’appela du nom de Noé, en disant: «Celui-ci nous soulagera de nos labeurs et de la peine qu’impose à nos mains un sol maudit par le Seigneur.» Après avoir engendré Noé, Lamek vécut encore cinq cent quatre-vingt-quinze ans et engendra des fils et des filles. Lamek vécut en tout sept cent soixante-dix-sept ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            31,
            'Lamek vécut cent quatre-vingt-deux ans, puis il engendra un fils. Il l’appela du nom de Noé, en disant: «Celui-ci nous soulagera de nos labeurs et de la peine qu’impose à nos mains un sol maudit par le Seigneur.» Après avoir engendré Noé, Lamek vécut encore cinq cent quatre-vingt-quinze ans et engendra des fils et des filles. Lamek vécut en tout sept cent soixante-dix-sept ans; puis il mourut.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            

            INSERT INTO "verses" ("chapterID", "translationID", "number", "text") VALUES
            ((SELECT "id" FROM "chapters" WHERE "bookID" = 'GEN' AND "number" = 5),
            (SELECT "id" FROM "translations" WHERE "code" = 'aelf'),
            32,
            'Noé était âgé de cinq cents ans quand il engendra Sem, Cham et Japhet.')
            ON CONFLICT ("chapterID", "translationID", "number") DO NOTHING;
            
COMMIT;
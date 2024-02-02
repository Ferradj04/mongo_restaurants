/*1_Donnez la liste de tous les restaurants de la collection, triée par ordre de noms
croissant*/
db.restaurants.find(
    {}, 
    {
        _id:0
    }
).sort(
    {
        name:1
    }
).pretty()
/*2_Donnez la liste de tous les restaurants proposant une cuisine de type "Italian" et
affichez, pour chacun d’entre eux, le nom, le code postal et les coordonnées géographiques. De
plus, assurez-vous que la réponse soit ordonnée selon la clef de tri (code postal croissant, nom
décroissant).*/
db.restaurants.find(
    {cuisine:"Italian"},
    {
        _id:0,
        name:1,
        "address.coord":1,
        "address.zipcode":1
    }
).sort(
    {
        "address.zipcode":1, 
         name:-1
    }
).pretty()
/*3_Donnez la liste de tous les restaurants italiens ayant pour code postal "10075" et
pour lesquels le numéro de téléphone est fourni dans la base de données. Affichez nom, code
postal et numéro de téléphone.*/
db.restaurants.find(
    {
        cuisine:"Italian",
        "address.zipcode":"10075",
        telephoneNumber:{$ne : null}
    },
    {
        _id:0,
        name:1,
        "address.zipcode":1,
        telephoneNumber:1
    }
).pretty()
/*4_Trouvez tous les restaurants ayant au moins un score supérieur ou égal à 50.*/
db.restaurants.find(
    {
        "grades.score":{$gt : 50}
    },
    {
        _id:0
    }
).pretty()
/*5_Donnez la liste de tous les restaurants qui sont soit italiens, soit ayant le code
postal “10075”.*/
db.restaurants.find(
    {
        $or : [{cuisine:"Italian"},{"address.zipcode":"10075"}]
    },
    {
        _id:0, 
    }
).pretty()
/*6_Donnez la liste de tous les restaurants dont le code postal est “10075” ou “10098”,
dont la cuisine est soit italienne, soit américaine, et ayant au moins un score supérieur ou égal à
50*/
db.restaurants.find(
    {
        $and:[
            {$or:[
                {"address.zipcode":"10075"},
                {"address.zipcode":"10098"}
            ]},
            {$or:[
                {cuisine:"Italian"},
                {cuisine:"American"}
            ]},
            {"grades.score":{$gt:50}}],
    },
    {
        _id:0
    }
).pretty()
/*7_Donnez la liste de tous les restaurants ayant au moins un score concernant la
catégorie customer service, price ou quality. Affichez simplement les noms, la cuisine et le code
postal.*/
db.restaurants.find(
    {
        $or: 
        [
            {
                $and:[
                        {"grades.category":"customer service"},
                        {"grades.score": {$exists: true}}
                ]
            },
            {
                $and:[
                        {"grades.category":"quality"},
                        {"grades.score":{$exists: true}}
                ]
            },
            {
                $and:[  {"grades.category":"price"},
                        {"grades.score": {$exists: true} }
                ]
            }
        ]
    },
    {
        _id:0,
        name:1, 
        cuisine:1,
        "address.zipcode":1,
        "grades.category":1
    }
).pretty()
/*8_Modifiez le type de cuisine du restaurant "Juni" pour le mettre à "American (new)".
Enregistrez également dans un champ "lastModified" la date et l’heure du système au moment
où la modification est effectuée. S’il existe plusieurs restaurants portant le même nom, seul le
premier doit être modifié*/
db.restaurants.updateOne(
    {
        cuisine:"Juni"
    },
    {
        $set:
        {
            cuisine:"American"
        },
        $currentDate: { lastModified: true }
    }, 
)
/*9_Changez l’adresse du restaurant dont l’identifiant (restaurant_id) est "41156888"
en "East 31st Street".*/
db.restaurants.updateOne(
    {
        restaurant_id:"41156888"
    },
    {
        $set:
        {
            "address.street":"East 31st Street"
        }
    }
)
/*10_Changez le type de cuisine de tous les restaurants dont le code postal est "10016"
et le type de cuisine "Other" en "Cuisine to be determined". Enregistrez également dans un champ
"lastModified" la date et l’heure du système au moment où la modification est effectuée.*/
db.restaurants.updateMany(
    {
        $and:
        [
            {"address.zipcode":"10016"},
            {cuisine:"Other"}
        ]
    },
    {
        $set:
        {
            cuisine:"Cuisine to be determined"
        },
        $currentDate: { lastModified: true }
    }
)
/*11_Remplacez toute l’information concernant le restaurant dont l’identifiant est
"41154403" par l’information suivante :
"name":"Vella 2",
"address": 
{
    "city":"1480",
    "street":"2 Avenue" ,
    "zipcode":" 10075 "
}
*/
db.restaurants.updateMany(
    {
        restaurant_id:"41154403"
    },
    {
        $set:{
            "name":"Vella 2",
            "address": 
            {
                "city":"1480",
                "street":"2 Avenue" ,
                "zipcode":" 10075 "
            }
        }
    }
)
/*12_Dressez la liste des types de cuisine représentés dans la base. Pour chaque type,
affichez le nombre de restaurants associés. Ordonnez le résultat par nombre de restaurants
décroissants.*/
db.restaurants.aggregate(
    [
        {$match:{}},
        {$group:{_id:"$cuisine",count:{$sum:1}}},
        {$sort:{count:-1}}
    ]
)
/*13_Affichez, pour chaque code postal, le nombre de restaurants italiens ayant ce
code postal. Ordonnez le résultat par nombre de restaurants décroissants.*/ 
db.restaurants.aggregate(
    [
        {$match:{}},
        {$group:{_id:"$address.zipcode",count:{$sum:1}}},
        {$sort:{count:-1}}
    ]
)
/*14_Considérez les restaurants italiens dont l’identifiant (restaurant_id) est supérieur
ou égal à "41205309", et possédant un attribut "averagePrice". Calculez la moyenne de ces prix
moyens. Puis refaites la même opération en calculant la moyenne par code postal.*/
/*Dans la partie du pipeline du calcule du prix moyen, On utilise le stage Project pour evaluer une quantité dependante 
des autre attributs calculés d'une maniére simultanée alors il faut forcément ajouté la prtie $project pour calculé le moyenne 
qu'elle est une quantité depandante des autre quantités calculables*/ 
db.restaurants.aggregate(
    [
        {
            $match:
            {
                $and:
                [
                    {restaurant_id:{$gt:"41205309"}},
                    {averagePrice:{$exists: true}},
                    {cuisine:"Italian"}
                ]
            }
        },
        {
            $group:
            {   
                _id:"$cuisine",
                sum_average_price:{$sum:"$averagePrice"},
                number_restaurants:{$sum:1},
            }
        },
        {
            $project: 
            {
                moyenne_prix:{$divide:["$sum_average_price","$number_restaurants"]}
            }
        },
        {
            $sort:{moyenne_prix:-1}
        }
    ]
)
/*On peut accéder à une propiété embarqué [nested/embedded document] ou un tableau des documents embarqués 
[Array of embedded documents] à travers un accée ponctué "embeddedDoc.property",
Comme on peut accéder à  
*/
db.restaurants.aggregate(
    [
        {
            $match:
            {
                $and:
                [
                    {restaurant_id:{$gt:"41205309"}},
                    {averagePrice:{$exists: true}},
                    {cuisine:"Italian"}
                ]
            }
        },
        {
            $group:
            {   
                _id:"$address.zipcode",
                sum_average_price:{$sum:"$averagePrice"},
                number_restaurants:{$sum:1},
            }
        },
        {
            $project: 
            {
                moyenne_prix:{$divide:["$sum_average_price","$number_restaurants"]}
            }
        },
        {
            $sort:{moyenne_prix:-1}
        }
    ]
)
/*15_Créer une nouvelle collection appelée "comments", dans la même base de données.*/
db.createCollection("comments")
/*16_Insérez trois documents dans la collection précédemment créée, en utilisant le
schéma suivant :
{
"_id":" ----",
"restaurant_id":"----",
" client_id":"----",
"comment":"----",
"date":ISODate(" ----"),
"type":" ----",
}
*/
db.comments.insertMany( 
    [
        { 
            restaurant_id:"30075445",
            client_id:"4582",
            comment:"Le restaurant est génial, le menu est vraiment top !",
            date: new Date(),
            type:"positive",
        },
        { 
            restaurant_id:"40356068",
            client_id:"3512",
            comment:"Vos machins sont vraiment nul !",
            date: new Date(),
            type:"négative",
        },
        { 
            restaurant_id:"40356151",
            client_id:"5621",
            comment:"Le menu est à la hauteur, bonne continuation !!",
            date: new Date(),
            type:"positive",
        }
])
/*17_Donnez la liste de tous les commentaires de votre base de données. Chaque
commentaire doit contenir également toutes les informations concernant le restaurant auquel il
se rapporte.*/
db.comments.find(
    {},
    {
        _id:0
    }
).pretty()
/*18_Insérez 7 autres documents dans la collection comments, en suivant le schéma
précédemment décrit, et en respectant les règles suivantes :
— les identifiants de restaurants doivent correspondre à des restaurants existants dans la
collection restaurants ;
— l’un des restaurants au moins doit avoir plusieurs commentaires ;
— l’un des clients au moins doit avoir commenté plusieurs fois ;
— l’un des clients au moins doit avoir commenté plusieurs fois le même restaurant ;
— l’attribut type peut prendre uniquement les valeurs "positive" ou "négative".*/
db.comments.insertMany( 
    [
        { 
            restaurant_id:"30075445",
            client_id:"3512",
            comment:"Le service est bien.",
            date: new Date(),
            type:"positive",
        },
        { 
            restaurant_id:"40356068",
            client_id:"5621",
            comment:"La salade est trés salé, yaay !",
            date: new Date(),
            type:"négative",
        },
        { 
            restaurant_id:"40356151",
            client_id:"3512",
            comment:"Mmmm pas mal !!",
            date: new Date(),
            type:"positive",
        },
        { 
            restaurant_id:"30075445",
            client_id:"4582",
            comment:"Le prix est vraiment haut !",
            date: new Date(),
            type:"négative",
        },
        { 
            restaurant_id:"40356068",
            client_id:"4582",
            comment:"Vos machins sont vraiment nul !",
            date: new Date(),
            type:"négative",
        },
        { 
            restaurant_id:"40356151",
            client_id:"3512",
            comment:"Mmmm bien !!",
            date: new Date(),
            type:"positive",
        },
        { 
            restaurant_id:"30075445",
            client_id:"5621",
            comment:"Les pates sont bonnes !!",
            date: new Date(),
            type:"positive",
        }
])
/*19_Trouvez la liste des restaurants ayant des commentaires, et affichez pour chaque
restaurant uniquement le nom et la liste des commentaires. Plusieurs stratégies sont possibles.
La fonction aggregate utilise comme un parametre une liste array, dans cette liste on peut trouver 
plusieurs attribut stage comme $match,$group,$lookup pour effectuer une jointure externe
Comme on peut utiliser l'attribut stage $match pout selectionner un ensemble bien définit de documents  
*/ 
db.restaurants.aggregate(
    [
        {
            $lookup: 
            {
                from:'comments',
                localField:'restaurant_id' ,
                foreignField: 'restaurant_id',
                as: 'commented_restaurants'
            },
        },
        {
            $match: 
            {
                commented_restaurants:{$ne: []}
            }
        }, 
        {
            $project: 
            {
                "name":1, 
                "commented_restaurants":1,
                "_id":0
            }
        }
    ], 
).pretty()
/*20_Créez un index ascendant sur l’attribut cuisine de 
la collection restaurants.*/ 
db.restaurants.createIndex({cuisine:1})
/*21_Créez un autre index pour la collection restaurants, composé de l’attribut
cuisine (ascendant) et de l’attribut zipcode (descendant).*/ 
db.restaurants.createIndex({cuisine:1,"address.zipcode":-1})
/*22_Affichez la liste des index créés sur la collection restaurants.*/
db.restaurants.getIndexes()
/*23_Utilisez la méthode explain pour afficher le plan d’exécution d’une requête
renvoyant tous les restaurants italiens. Quelles informations sont fournies par le système ?*/
/*le nombre des objets retournés est est égale aux nombre de documents examinés, avant la
creation des indexes, la difference été grande mais aprés la création de ces derniers
la difference a été minimisé ou bien le nombre à été optimisé
*/ 
db.restaurants.find().explain()
/*24_Même question mais en ajoutant l’argument "executionStats" en paramètre de
la méthode explain.*/
db.restaurants.find().explain("executionStats")
/*la difference été grande mais aprés la création de ces derniers
la difference a été minimisé ou bien le nombre à été optimisé*/
/*25_Supprimez les deux index que vous avez précédemment créés, puis affichez à
nouveau les statistiques sur le plan d’exécution de la requête renvoyant tous les restaurants
italiens. Que constatez-vous ?*/ 
db.restaurants.dropIndex({cuisine:1})
db.restaurants.dropIndex({cuisine:1,"address.zipcode":-1})
db.restaurants.find().explain("executionStats")
/*Reponse : La requéte n'est pas optimisée et donc le temp de reponse sera trés long !!*/ 

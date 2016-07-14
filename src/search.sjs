var geojson = require('/MarkLogic/geospatial/geojson.xqy');

//decode the user's input
var rawInput = xdmp.getRequestBody();
var input = rawInput.toObject();

//log the input to ErrorLog.txt
//xdmp.log("Input received by Kevin's search.sjs: " + xdmp.quote(rawInput));

//searchRegions is an array of the user's search regions
var searchRegions = [];
//bounds is a box representing the current map window
var bounds = cts.box.apply(null,input.mapWindow);

if (input.searchRegions.features.length == 0) {
  //if the user didn't provide a search region, then use the window bounds.
  searchRegions.push(bounds);
} else {
  //loop through the user's search regions and populate the searchRegions array.
  for (var i = 0; i < input.searchRegions.features.length; i++) {
    //decode input from GeoJSON format
    var r = geojson.parseGeojson(input.searchRegions.features[i].geometry);
    searchRegions.push(r);
  }
}

////////////////////////////////////////////////////////////////////////////////

//log searchRegions to ErrorLog.txt
xdmp.log("searchRegions: " + xdmp.quote(searchRegions));

var geoQuery = cts.elementGeospatialQuery(
  xs.QName("coordinates"),
  searchRegions,
  "type=long-lat-point");

var geoQueryJson = cts.jsonPropertyGeospatialQuery(
  "coordinates",
  searchRegions,
  "type=long-lat-point");

var geoQueries = cts.orQuery([geoQuery, geoQueryJson]);

var qry = geoQueries;
if (input.searchString != "") {
  var wordQuery = cts.wordQuery(input.searchString);
  qry = cts.andQuery([wordQuery,geoQueries]);
}

var results = cts.search(qry);



////////////////////////////////////////////////////////////////////////////////

//format the results to be returned to the front-end
//var features = [];


/*for (var result of results) {
  //for school data (KML), convert to GeoJSON and format description for output.
  // if below should never be taken
  var loc = result.xpath("/Placemark/Point/coordinates/data()").toString().trim();
  if (loc!="") {
    var ptJson = geojson.toGeojson(cts.longLatPoint(loc));
    var name = result.xpath("/Placemark/ExtendedData/Data[@name='facility_n']/value/data()");
    var type = result.xpath("/Placemark/ExtendedData/Data[@name='school_typ']/value/data()");
    var dept = result.xpath("/Placemark/ExtendedData/Data[@name='deptname']/value/data()");
    var feature = {
      type:"Feature",
      properties: {
        name: name,
        description: type + ". " + dept + "."
      },
      geometry: ptJson
    };
    features.push(feature);
  } else {
    //the other types of data are already stored as GeoJSON objects.
    var res = result.toObject();
    features.push(res);
  }
}*/


// http://www.json-generator.com/#
var features =[
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007cfff2a7b6ebc5b1f2",
      "age": 23,
      "eyeColor": "blue",
      "name": "Elma Baker",
      "gender": "female",
      "company": "COLLAIRE",
      "email": "elmabaker@collaire.com",
      "phone": "+1 (964) 489-2624",
      "address": "846 Malta Street, Bennett, New Jersey, 1062",
      "about": "Magna laborum veniam anim consectetur dolor enim proident fugiat nulla. Pariatur ut cillum duis elit. Incididunt laborum nostrud ea sint ipsum duis eiusmod exercitation qui consectetur duis. Ipsum occaecat Lorem sit ut elit cillum quis sunt non do. Qui in amet mollit amet irure. Nisi ipsum cupidatat cillum velit occaecat eiusmod adipisicing commodo ea aute occaecat sint dolor.\r\n",
      "features": [],
      "postalCode": 88847,
      "registered": "2016-06-10T01:20:31 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        84.0544,
        35.8594
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c652d945faf8e760a",
      "age": 35,
      "eyeColor": "green",
      "name": "Penny Wiggins",
      "gender": "female",
      "company": "OMATOM",
      "email": "pennywiggins@omatom.com",
      "phone": "+1 (931) 599-3601",
      "address": "447 Buffalo Avenue, Wilsonia, Arizona, 2465",
      "about": "Nisi exercitation exercitation exercitation ex qui Lorem magna do cillum. Incididunt occaecat magna qui ut ea aliquip officia cupidatat magna. Ipsum enim exercitation consequat dolore minim et adipisicing mollit exercitation laborum. Deserunt Lorem deserunt occaecat dolore ad sit in fugiat fugiat proident ullamco. In eu est et id deserunt veniam nisi reprehenderit id elit esse fugiat. Qui non deserunt in adipisicing fugiat veniam ipsum aute veniam consequat. Et qui elit consectetur ea esse ipsum aliquip cupidatat Lorem fugiat qui fugiat magna.\r\n",
      "features": [
        "Zenthall",
        "Isotronic",
        "Vixo",
        "Adornica",
        "Gorganic",
        "Bristo",
        "Imageflow"
      ],
      "postalCode": 89259,
      "registered": "2015-10-08T07:46:26 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        -36.0756,
        20.9364
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c69a8fac435cb4f69",
      "age": 40,
      "eyeColor": "green",
      "name": "Walters Ramos",
      "gender": "male",
      "company": "STRALOY",
      "email": "waltersramos@straloy.com",
      "phone": "+1 (895) 512-2114",
      "address": "593 Grattan Street, Brewster, Alaska, 302",
      "about": "Quis nisi ipsum voluptate minim irure nulla deserunt tempor non enim ullamco ad quis exercitation. Non mollit duis est mollit excepteur aliqua est deserunt non. Reprehenderit ea aliqua qui id eiusmod tempor sint magna incididunt ipsum consequat.\r\n",
      "features": [
        "Extro",
        "Centice",
        "Cowtown"
      ],
      "postalCode": 85246,
      "registered": "2014-05-28T09:25:21 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        86.2556,
        -13.356
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007ce18dead2b8b39f3d",
      "age": 35,
      "eyeColor": "brown",
      "name": "Trevino Whitney",
      "gender": "male",
      "company": "XEREX",
      "email": "trevinowhitney@xerex.com",
      "phone": "+1 (916) 436-3414",
      "address": "490 Colonial Court, Glenbrook, Michigan, 731",
      "about": "Fugiat elit ex id consectetur irure. Tempor aute nulla dolore excepteur fugiat ex fugiat qui do dolore. Labore id ex eu occaecat. Adipisicing magna Lorem id eiusmod. Commodo veniam ipsum ad nulla elit tempor et sit aute fugiat voluptate reprehenderit ullamco consectetur. Aliqua sunt ut veniam incididunt sit Lorem qui commodo ipsum tempor eu.\r\n",
      "features": [
        "Envire",
        "Cytrak",
        "Shadease",
        "Earthwax",
        "Nurali",
        "Zolar"
      ],
      "postalCode": 89948,
      "registered": "2016-05-04T02:22:03 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        96.5683,
        -9.1904
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007cd400503dace87187",
      "age": 33,
      "eyeColor": "green",
      "name": "Kimberly Clemons",
      "gender": "female",
      "company": "COLUMELLA",
      "email": "kimberlyclemons@columella.com",
      "phone": "+1 (950) 599-2400",
      "address": "155 Gain Court, Osmond, Massachusetts, 8297",
      "about": "Eiusmod in elit pariatur cillum reprehenderit deserunt esse. Nisi duis irure officia anim nisi magna eiusmod occaecat ut. Ut sit ullamco non labore velit mollit magna exercitation. Reprehenderit commodo non sunt do. Ut officia laborum et sint ullamco nulla commodo laborum nostrud fugiat non do nostrud qui. Irure eu anim consequat aliqua proident consectetur magna occaecat in. Duis laboris occaecat ad id est voluptate adipisicing.\r\n",
      "features": [
        "Gynk"
      ],
      "postalCode": 91551,
      "registered": "2015-10-23T06:20:05 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        10.3583,
        12.3064
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007cf1e8eaa2dbcbfbaf",
      "age": 29,
      "eyeColor": "blue",
      "name": "Tasha Rollins",
      "gender": "female",
      "company": "NAVIR",
      "email": "tasharollins@navir.com",
      "phone": "+1 (989) 407-2768",
      "address": "104 Bayard Street, Cutter, Missouri, 5586",
      "about": "Aute enim proident laborum velit sit commodo aliqua adipisicing elit excepteur in. Pariatur dolore pariatur nostrud ipsum exercitation. Est aliqua duis esse nulla enim ipsum veniam. Pariatur est minim quis amet dolor amet laboris anim ea. Mollit labore tempor est voluptate minim magna pariatur elit officia proident.\r\n",
      "features": [
        "Geologix",
        "Acruex"
      ],
      "postalCode": 97047,
      "registered": "2015-03-03T01:45:25 +08:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        -11.9837,
        28.8714
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007cdfce991f4e218423",
      "age": 33,
      "eyeColor": "green",
      "name": "Bryan Swanson",
      "gender": "male",
      "company": "NORSUL",
      "email": "bryanswanson@norsul.com",
      "phone": "+1 (953) 596-3061",
      "address": "456 Woodpoint Road, Echo, Maryland, 900",
      "about": "Occaecat nulla dolore consectetur consectetur. Adipisicing quis fugiat dolor cupidatat sint nostrud. Ea velit veniam incididunt proident dolor incididunt.\r\n",
      "features": [
        "Frenex",
        "Emtrak",
        "Tingles",
        "Zillatide"
      ],
      "postalCode": 82557,
      "registered": "2014-07-27T10:39:52 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        72.7811,
        48.7423
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007ccf79a3b8cbc36ecb",
      "age": 39,
      "eyeColor": "brown",
      "name": "Beverly Willis",
      "gender": "female",
      "company": "RAMJOB",
      "email": "beverlywillis@ramjob.com",
      "phone": "+1 (971) 402-2164",
      "address": "137 Estate Road, Kieler, Vermont, 1650",
      "about": "Occaecat amet id occaecat proident sunt eiusmod adipisicing enim enim. Esse proident officia enim quis pariatur nulla dolor. Nisi duis labore ut exercitation duis. Ex mollit laboris ea Lorem tempor est aute aliquip. Nulla ea anim commodo laborum veniam nisi eu minim eu Lorem aliqua proident sit. Anim nulla nisi magna aliquip occaecat in enim qui exercitation mollit aliquip do.\r\n",
      "features": [
        "Repetwire",
        "Vortexaco"
      ],
      "postalCode": 80342,
      "registered": "2014-04-11T05:16:24 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        15.5252,
        -18.695
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c4d4b0e01f421d10a",
      "age": 21,
      "eyeColor": "brown",
      "name": "Deirdre Ortega",
      "gender": "female",
      "company": "BULLJUICE",
      "email": "deirdreortega@bulljuice.com",
      "phone": "+1 (982) 443-3983",
      "address": "440 Highlawn Avenue, Ebro, North Carolina, 1492",
      "about": "Anim eu consectetur proident do est eu nisi labore esse ullamco commodo et in aute. Duis quis minim esse ad ullamco et ullamco magna consequat reprehenderit. Eu fugiat adipisicing laboris velit. Ipsum ex ullamco elit anim non mollit dolor fugiat nostrud. Dolor ut velit ea tempor sint dolore velit labore adipisicing duis do magna incididunt. Mollit laborum nostrud incididunt ullamco anim nulla adipisicing eu ex nisi exercitation minim.\r\n",
      "features": [
        "Rugstars",
        "Printspan",
        "Kage",
        "Cytrex",
        "Austex",
        "Coash"
      ],
      "postalCode": 98151,
      "registered": "2015-09-21T09:43:32 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        61.1279,
        23.2938
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007ce3fbf619c4a4e848",
      "age": 36,
      "eyeColor": "blue",
      "name": "Candace Huff",
      "gender": "female",
      "company": "OPTICALL",
      "email": "candacehuff@opticall.com",
      "phone": "+1 (916) 591-3120",
      "address": "419 Herzl Street, Elliston, Tennessee, 8531",
      "about": "Ut ex elit ex ex proident ut fugiat nostrud anim aliqua. Magna id consectetur deserunt laboris nostrud adipisicing dolor. Tempor sunt fugiat anim ea irure mollit nisi dolor elit do sunt ex voluptate exercitation. Voluptate adipisicing laborum magna fugiat nulla ut laboris nulla culpa tempor mollit laborum. Mollit nulla reprehenderit laborum ad.\r\n",
      "features": [
        "Franscene",
        "Vantage"
      ],
      "postalCode": 92552,
      "registered": "2016-07-01T11:41:32 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        -7.007,
        26.0697
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007ca12399010170cfeb",
      "age": 30,
      "eyeColor": "green",
      "name": "Eva Soto",
      "gender": "female",
      "company": "MICROLUXE",
      "email": "evasoto@microluxe.com",
      "phone": "+1 (868) 566-2847",
      "address": "712 Brightwater Avenue, Thornport, Washington, 7183",
      "about": "Occaecat magna do officia ipsum qui est duis. Amet sit id laborum non occaecat elit nulla fugiat do labore nisi minim. Esse consectetur esse labore duis est aute aliquip nisi cillum. Dolore esse adipisicing mollit ut exercitation consequat ipsum do magna exercitation exercitation. Nulla magna anim irure consectetur non tempor Lorem eu magna sit ad. Minim tempor labore id veniam proident occaecat proident consequat aute cillum nisi id culpa occaecat.\r\n",
      "features": [
        "Scenty"
      ],
      "postalCode": 80345,
      "registered": "2014-06-01T10:25:11 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        12.0381,
        11.5424
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c1361fc65785bc2f3",
      "age": 20,
      "eyeColor": "brown",
      "name": "Lawson Weaver",
      "gender": "male",
      "company": "METROZ",
      "email": "lawsonweaver@metroz.com",
      "phone": "+1 (828) 446-3772",
      "address": "794 Jamison Lane, Williamson, Indiana, 4224",
      "about": "Labore mollit excepteur minim fugiat labore. Culpa cupidatat commodo laborum reprehenderit commodo commodo reprehenderit. Culpa qui do id labore pariatur fugiat elit ipsum fugiat tempor tempor ut. Tempor occaecat nulla duis Lorem minim magna excepteur. Veniam deserunt minim aute eiusmod voluptate incididunt Lorem fugiat exercitation est eiusmod.\r\n",
      "features": [
        "Cognicode",
        "Netbook",
        "Limage"
      ],
      "postalCode": 80559,
      "registered": "2015-02-14T03:32:32 +08:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        53.5523,
        17.9644
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c497114c8ceafa4f4",
      "age": 37,
      "eyeColor": "brown",
      "name": "Schneider Hensley",
      "gender": "male",
      "company": "PASTURIA",
      "email": "schneiderhensley@pasturia.com",
      "phone": "+1 (864) 416-3518",
      "address": "460 Cumberland Walk, Marne, American Samoa, 9095",
      "about": "Laborum ea nostrud aliqua est amet velit velit nostrud aute dolor deserunt amet laboris. Do sint cillum ut aliqua irure labore id officia voluptate id elit anim. Proident do non irure officia ea elit ipsum dolor commodo qui occaecat do laboris enim. Culpa dolore veniam quis in eu. Aliquip fugiat aliqua non minim ex do culpa ea. Ex elit non ea amet voluptate do cillum fugiat velit dolore.\r\n",
      "features": [
        "Canopoly",
        "Turnabout",
        "Buzzopia"
      ],
      "postalCode": 88647,
      "registered": "2014-01-08T09:07:50 +08:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        -34.8366,
        14.3011
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007ca16caef8ecade78f",
      "age": 31,
      "eyeColor": "green",
      "name": "Rosalind Humphrey",
      "gender": "female",
      "company": "PULZE",
      "email": "rosalindhumphrey@pulze.com",
      "phone": "+1 (905) 444-2735",
      "address": "891 Varanda Place, Albany, Kansas, 3712",
      "about": "Mollit quis mollit adipisicing eiusmod cupidatat nostrud sint in ut. Consectetur adipisicing enim enim sit nisi qui ut nulla. Ad nisi irure excepteur reprehenderit.\r\n",
      "features": [],
      "postalCode": 91443,
      "registered": "2016-03-14T09:14:57 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        30.4109,
        14.5923
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c7c7749c2daf68933",
      "age": 22,
      "eyeColor": "brown",
      "name": "Katy Cooke",
      "gender": "female",
      "company": "VERTON",
      "email": "katycooke@verton.com",
      "phone": "+1 (946) 544-2323",
      "address": "787 Essex Street, Brandermill, Alabama, 9238",
      "about": "Ipsum nostrud id nisi minim deserunt elit irure incididunt anim Lorem et aliquip anim. Occaecat pariatur aliqua fugiat amet. Pariatur et duis tempor culpa occaecat mollit ex tempor minim labore quis. Magna ipsum et ex eu eu ad culpa aliquip non. Pariatur irure consectetur ipsum eu sunt irure duis voluptate occaecat. Id amet cupidatat nulla aliquip culpa quis.\r\n",
      "features": [],
      "postalCode": 98151,
      "registered": "2015-03-20T08:41:03 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        15.1962,
        46.8418
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007ce8491269ffc0096e",
      "age": 21,
      "eyeColor": "brown",
      "name": "Gabriela Valencia",
      "gender": "female",
      "company": "QUOTEZART",
      "email": "gabrielavalencia@quotezart.com",
      "phone": "+1 (939) 533-2233",
      "address": "221 Veronica Place, Beechmont, Palau, 1635",
      "about": "Incididunt exercitation sunt ea sint eu mollit labore nulla do id dolor amet commodo. Commodo sunt exercitation nisi aliqua consectetur. Non sint incididunt voluptate quis magna consectetur eu. Laboris enim consequat dolor id. Minim nisi cupidatat ipsum qui dolor velit eiusmod sit cupidatat. Est esse exercitation in anim magna veniam ullamco dolore non voluptate laboris ad pariatur elit.\r\n",
      "features": [
        "Autograte",
        "Zanity",
        "Assistix",
        "Trasola",
        "Rocklogic",
        "Assurity"
      ],
      "postalCode": 85651,
      "registered": "2015-09-13T03:54:50 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        64.2973,
        -16.1874
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c0028a09e063cad03",
      "age": 36,
      "eyeColor": "green",
      "name": "Dotson Michael",
      "gender": "male",
      "company": "SUSTENZA",
      "email": "dotsonmichael@sustenza.com",
      "phone": "+1 (894) 520-2401",
      "address": "959 Lawton Street, Manchester, South Dakota, 176",
      "about": "Sint culpa laborum fugiat minim velit do tempor dolore tempor qui et esse in. Ea proident consequat proident in enim. Reprehenderit occaecat quis velit do in. Aliquip laborum ullamco anim excepteur enim ex quis labore aliquip culpa ipsum elit adipisicing.\r\n",
      "features": [],
      "postalCode": 86741,
      "registered": "2015-12-29T09:35:45 +08:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        28.6795,
        -2.577
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c576e24d792a46bb2",
      "age": 40,
      "eyeColor": "brown",
      "name": "Bullock Burris",
      "gender": "male",
      "company": "MANTRIX",
      "email": "bullockburris@mantrix.com",
      "phone": "+1 (912) 440-3182",
      "address": "437 Erasmus Street, Comptche, Connecticut, 4980",
      "about": "Incididunt mollit in cillum ut commodo consequat elit consectetur proident sit. Proident non commodo occaecat Lorem do aliquip non pariatur qui nostrud. Duis sit sunt et aliqua culpa incididunt pariatur elit deserunt fugiat. Ullamco ullamco adipisicing mollit aute in cupidatat nulla deserunt. Laboris ad elit sint elit laboris dolore dolore sint quis sunt magna commodo magna. Excepteur sunt est excepteur Lorem do officia.\r\n",
      "features": [
        "Exospace",
        "Unia"
      ],
      "postalCode": 97755,
      "registered": "2015-12-05T01:01:39 +08:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        57.9579,
        -2.3934
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c15a046be380f9e11",
      "age": 37,
      "eyeColor": "blue",
      "name": "Pate Schmidt",
      "gender": "male",
      "company": "ASSISTIA",
      "email": "pateschmidt@assistia.com",
      "phone": "+1 (997) 423-2970",
      "address": "476 Jardine Place, Gila, Idaho, 1636",
      "about": "Aliquip anim dolore ea commodo. Enim voluptate duis officia anim fugiat dolore minim sit nostrud culpa. Culpa ex occaecat mollit ad. Magna consequat Lorem voluptate ipsum culpa aliquip dolore commodo. Elit exercitation ut eu incididunt duis dolore. Exercitation ea cillum velit qui sint aliqua eiusmod nisi nisi.\r\n",
      "features": [
        "Geekola",
        "Comstruct",
        "Knowlysis",
        "Terrasys"
      ],
      "postalCode": 89954,
      "registered": "2014-02-11T11:27:13 +08:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        -23.1555,
        20.8124
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c12dfe83e91abb609",
      "age": 22,
      "eyeColor": "blue",
      "name": "Hilary Carroll",
      "gender": "female",
      "company": "POLARIA",
      "email": "hilarycarroll@polaria.com",
      "phone": "+1 (949) 406-3198",
      "address": "766 Drew Street, Morningside, Guam, 1396",
      "about": "Et dolore velit occaecat non ipsum ad dolor culpa ipsum. Nisi esse Lorem commodo cupidatat aliquip. Eiusmod reprehenderit sunt culpa commodo officia. Enim amet dolore mollit qui ut. Amet culpa ullamco tempor est occaecat.\r\n",
      "features": [
        "Halap",
        "Bleendot",
        "Xplor",
        "Aquazure",
        "Tsunamia",
        "Bostonic",
        "Boink"
      ],
      "postalCode": 84458,
      "registered": "2015-06-14T10:54:21 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        -17.5068,
        -14.817
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007cda3bb3423e0b3326",
      "age": 28,
      "eyeColor": "blue",
      "name": "Freeman Dillon",
      "gender": "male",
      "company": "VIRVA",
      "email": "freemandillon@virva.com",
      "phone": "+1 (901) 541-3842",
      "address": "485 Fay Court, Trail, Oklahoma, 5559",
      "about": "Excepteur dolor enim sit ea anim cillum. Aute quis dolore commodo elit aute proident mollit cupidatat aliqua. Eu fugiat fugiat cupidatat eu pariatur deserunt. Occaecat cillum Lorem eu labore. Dolore mollit irure laboris culpa fugiat.\r\n",
      "features": [
        "Recritube",
        "Newcube"
      ],
      "postalCode": 85148,
      "registered": "2015-09-09T01:38:52 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        6.5131,
        14.8673
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c06cf91374f195e64",
      "age": 24,
      "eyeColor": "green",
      "name": "Jefferson Herrera",
      "gender": "male",
      "company": "ZISIS",
      "email": "jeffersonherrera@zisis.com",
      "phone": "+1 (962) 562-2737",
      "address": "481 Ashland Place, Dowling, Minnesota, 6814",
      "about": "Magna labore ipsum pariatur ex duis minim dolore. Sint elit nulla incididunt sit duis et. Aute nisi dolore nostrud veniam occaecat proident non laboris nostrud sint qui consequat exercitation aute. Pariatur minim id magna sunt Lorem cupidatat esse dolore cupidatat aliquip duis voluptate quis ad. Occaecat deserunt incididunt Lorem id in nostrud reprehenderit ea.\r\n",
      "features": [
        "Automon",
        "Medicroix",
        "Xymonk",
        "Capscreen"
      ],
      "postalCode": 88843,
      "registered": "2014-03-08T10:37:34 +08:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        -14.0797,
        -11.4732
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c882fbd0a8ce45f33",
      "age": 39,
      "eyeColor": "green",
      "name": "Shelia Robinson",
      "gender": "female",
      "company": "RETRACK",
      "email": "sheliarobinson@retrack.com",
      "phone": "+1 (891) 483-2370",
      "address": "503 Jerome Street, Riverton, New York, 6392",
      "about": "Duis incididunt sint est ullamco qui qui laborum elit ut incididunt. Aliquip ullamco magna elit veniam. Amet incididunt fugiat sit nostrud. Irure cillum nisi commodo fugiat ullamco in dolor commodo.\r\n",
      "features": [
        "Geekus",
        "Ovolo",
        "Housedown",
        "Isologica",
        "Eplode"
      ],
      "postalCode": 97053,
      "registered": "2014-11-05T06:19:01 +08:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        82.7187,
        15.5273
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c519e6d94e4ea09a4",
      "age": 30,
      "eyeColor": "brown",
      "name": "Dejesus Hinton",
      "gender": "male",
      "company": "QUANTALIA",
      "email": "dejesushinton@quantalia.com",
      "phone": "+1 (884) 467-3830",
      "address": "313 Sharon Street, Murillo, Ohio, 9841",
      "about": "Est officia ea minim exercitation. Voluptate ea incididunt eiusmod sit ullamco elit amet. Id aliquip cupidatat amet eiusmod ad ullamco nulla elit incididunt ipsum Lorem esse non.\r\n",
      "features": [
        "Zinca",
        "Ezent",
        "Furnigeer",
        "Naxdis",
        "Visalia",
        "Ewaves"
      ],
      "postalCode": 88151,
      "registered": "2015-10-18T04:01:39 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        -26.9846,
        10.1989
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c6c218b5588491998",
      "age": 25,
      "eyeColor": "brown",
      "name": "Ora Conley",
      "gender": "female",
      "company": "BARKARAMA",
      "email": "oraconley@barkarama.com",
      "phone": "+1 (844) 401-2448",
      "address": "108 Dorchester Road, Chicopee, New Hampshire, 2156",
      "about": "Dolore consectetur id aute deserunt elit. Eiusmod duis voluptate ea amet consectetur labore mollit anim officia aute magna nulla nisi. Ipsum minim minim proident magna sit voluptate reprehenderit ex adipisicing.\r\n",
      "features": [
        "Ginkogene",
        "Rodeomad",
        "Zillar",
        "Geekol"
      ],
      "postalCode": 89043,
      "registered": "2015-08-06T01:27:04 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        84.8589,
        9.7799
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007cdf184329f984f461",
      "age": 24,
      "eyeColor": "blue",
      "name": "Wanda Buckley",
      "gender": "female",
      "company": "URBANSHEE",
      "email": "wandabuckley@urbanshee.com",
      "phone": "+1 (977) 453-3607",
      "address": "465 Beverley Road, Tilleda, Louisiana, 5953",
      "about": "Non enim excepteur nisi enim aute ut ipsum. Dolore nisi esse quis incididunt reprehenderit enim elit incididunt dolor laborum. Nisi eiusmod eu sunt aute ad dolore sint nulla velit. Tempor pariatur amet cupidatat voluptate est elit quis sint sit incididunt Lorem esse. Exercitation voluptate cupidatat sint et qui deserunt.\r\n",
      "features": [
        "Comvene",
        "Temorak",
        "Virxo",
        "Cosmosis",
        "Harmoney",
        "Koffee"
      ],
      "postalCode": 97754,
      "registered": "2014-08-24T02:20:24 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        91.8771,
        39.2524
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007cfbee974742d947b8",
      "age": 29,
      "eyeColor": "brown",
      "name": "Lynn Hull",
      "gender": "male",
      "company": "KAGGLE",
      "email": "lynnhull@kaggle.com",
      "phone": "+1 (886) 442-2454",
      "address": "918 Noel Avenue, Reinerton, Federated States Of Micronesia, 3796",
      "about": "Commodo aute eiusmod proident labore proident nostrud fugiat excepteur sint adipisicing qui. Deserunt consectetur voluptate aute consequat aliqua ad voluptate quis incididunt est qui ipsum non esse. Labore cupidatat do laboris sint deserunt officia. Commodo labore adipisicing in adipisicing officia aliquip anim. Id nostrud reprehenderit ea sit sit sunt reprehenderit aliquip ullamco fugiat duis aute proident do. Lorem id tempor eu et anim ad nulla irure ut do veniam adipisicing ea dolor.\r\n",
      "features": [
        "Ecolight",
        "Providco",
        "Keeg",
        "Insource"
      ],
      "postalCode": 95552,
      "registered": "2014-05-13T07:06:50 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        0.3589,
        10.3017
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c5a19b797251316e3",
      "age": 26,
      "eyeColor": "blue",
      "name": "Barrera Irwin",
      "gender": "male",
      "company": "INRT",
      "email": "barrerairwin@inrt.com",
      "phone": "+1 (837) 494-2590",
      "address": "936 Bevy Court, Dunlo, Arkansas, 9689",
      "about": "Consectetur tempor eiusmod duis sint velit exercitation. Tempor quis in cupidatat consequat exercitation aute. Est minim et ex cupidatat ex enim do fugiat ipsum id nisi id. Aute esse aliqua aliquip sit id nostrud. Occaecat est sunt in commodo anim minim proident exercitation sit sunt. Anim do nostrud laborum in adipisicing anim proident ipsum. Consectetur ullamco culpa eu pariatur ex proident id magna reprehenderit et.\r\n",
      "features": [
        "Valreda",
        "Enersol"
      ],
      "postalCode": 89859,
      "registered": "2015-07-09T08:07:13 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        31.538,
        36.4455
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007cfe6d32ec700442ac",
      "age": 40,
      "eyeColor": "green",
      "name": "Gilbert Randall",
      "gender": "male",
      "company": "NIKUDA",
      "email": "gilbertrandall@nikuda.com",
      "phone": "+1 (983) 571-3002",
      "address": "105 Matthews Court, Harleigh, Iowa, 5390",
      "about": "Ipsum esse ad occaecat ullamco esse officia. Lorem in excepteur exercitation adipisicing officia. Velit est fugiat proident exercitation laboris consectetur minim adipisicing sint incididunt. Veniam ullamco consectetur est cillum incididunt cupidatat sint qui sunt voluptate esse qui. Consectetur occaecat tempor enim ea dolor commodo dolor Lorem. Laboris laborum ullamco aliquip fugiat dolor quis nulla commodo nulla labore qui sit non. Est ex aliqua excepteur enim in cupidatat sint deserunt sit.\r\n",
      "features": [
        "Squish",
        "Aquafire",
        "Tourmania",
        "Emtrac",
        "Portalis"
      ],
      "postalCode": 87650,
      "registered": "2016-01-01T03:04:07 +08:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        9.6509,
        -4.6536
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c54f39b21daeb5aad",
      "age": 27,
      "eyeColor": "brown",
      "name": "Janell Warren",
      "gender": "female",
      "company": "EMPIRICA",
      "email": "janellwarren@empirica.com",
      "phone": "+1 (812) 428-2339",
      "address": "637 Cleveland Street, Dixonville, District Of Columbia, 6966",
      "about": "Lorem eu nulla minim cillum amet dolore excepteur occaecat excepteur quis nostrud mollit. Cupidatat nulla veniam ad aliquip minim quis incididunt commodo in id dolore aute nulla pariatur. Excepteur ea ullamco sint eu Lorem amet in minim. Tempor nostrud anim mollit nisi enim. Consequat ut sint cupidatat aliquip proident velit anim. Cupidatat sint est irure commodo cupidatat ea cillum elit cillum do adipisicing voluptate enim tempor.\r\n",
      "features": [
        "Gadtron",
        "Bezal",
        "Scentric",
        "Permadyne",
        "Miracula"
      ],
      "postalCode": 82244,
      "registered": "2014-03-04T02:23:04 +08:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        -11.5251,
        -16.693
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c4bab26fa9afdc2ba",
      "age": 33,
      "eyeColor": "blue",
      "name": "Underwood Mejia",
      "gender": "male",
      "company": "DADABASE",
      "email": "underwoodmejia@dadabase.com",
      "phone": "+1 (845) 558-3630",
      "address": "861 Bay Parkway, Wadsworth, Kentucky, 8368",
      "about": "Anim incididunt esse non reprehenderit anim excepteur sunt. Do sint labore quis ullamco voluptate minim fugiat. Minim reprehenderit excepteur aliquip duis do tempor ut excepteur sint exercitation ipsum nostrud. Elit consequat aliqua non sint sit incididunt eu duis minim voluptate. Reprehenderit aute minim consectetur sint elit irure sint non id deserunt.\r\n",
      "features": [
        "Biflex",
        "Enjola",
        "Furnitech",
        "Quailcom",
        "Opticon"
      ],
      "postalCode": 97248,
      "registered": "2015-01-13T09:59:45 +08:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        81.4513,
        2.5671
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c28904d8605b0c3b3",
      "age": 37,
      "eyeColor": "brown",
      "name": "Bass Winters",
      "gender": "male",
      "company": "JASPER",
      "email": "basswinters@jasper.com",
      "phone": "+1 (946) 472-3821",
      "address": "467 Kane Place, Flintville, Wyoming, 1569",
      "about": "Aliqua anim ut dolor eiusmod ad do officia et. Irure duis voluptate magna cupidatat nisi fugiat laboris commodo ex Lorem est nostrud. Proident commodo minim tempor id aliquip adipisicing deserunt nulla dolor velit sit aute minim. Cupidatat enim nostrud ut id anim. In qui laboris sint nostrud esse consequat fugiat et qui mollit culpa elit.\r\n",
      "features": [
        "Snowpoke",
        "Satiance",
        "Panzent",
        "Oronoko",
        "Zillidium",
        "Kiosk"
      ],
      "postalCode": 83355,
      "registered": "2015-06-14T04:30:48 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        87.0086,
        -9.6061
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c88c99589d36936f3",
      "age": 25,
      "eyeColor": "brown",
      "name": "Fowler Bowers",
      "gender": "male",
      "company": "COMTRACT",
      "email": "fowlerbowers@comtract.com",
      "phone": "+1 (807) 497-2625",
      "address": "824 Bridge Street, Gibbsville, Virgin Islands, 2810",
      "about": "Do labore dolore sunt tempor velit culpa in nostrud ex nostrud. Labore nostrud dolore aliquip ea enim nisi exercitation adipisicing ad nostrud ea proident mollit. Laboris qui elit dolore do reprehenderit. Laborum aliqua fugiat eu tempor ea aliqua ea ipsum et. Voluptate nisi irure laboris ex adipisicing ex cupidatat aliqua cillum cupidatat ut ad. Commodo amet deserunt eu nisi occaecat irure tempor esse elit adipisicing ex aute incididunt irure. Commodo consectetur ullamco mollit nulla ullamco quis.\r\n",
      "features": [
        "Dogtown",
        "Noralex",
        "Neptide",
        "Andershun",
        "Opticom",
        "Terragen",
        "Farmage"
      ],
      "postalCode": 82341,
      "registered": "2015-09-25T02:23:52 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        -31.2264,
        25.5059
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007cc708271c3238a70a",
      "age": 23,
      "eyeColor": "brown",
      "name": "Charmaine Mann",
      "gender": "female",
      "company": "ZENTIX",
      "email": "charmainemann@zentix.com",
      "phone": "+1 (953) 472-3728",
      "address": "862 Plymouth Street, Lodoga, Virginia, 3693",
      "about": "Sint aliqua esse sint ad exercitation duis commodo. Ex nostrud ipsum nisi sunt ipsum magna voluptate incididunt nulla Lorem do cillum. Ut adipisicing enim incididunt ipsum cillum sint veniam occaecat pariatur est consequat quis sunt. Voluptate minim veniam aliqua deserunt labore id enim. Consectetur irure anim et voluptate cupidatat laboris ullamco fugiat esse enim aliqua laborum labore excepteur. Velit laborum tempor ex exercitation voluptate ipsum Lorem do qui esse.\r\n",
      "features": [
        "Mediot",
        "Cujo"
      ],
      "postalCode": 90342,
      "registered": "2014-06-27T10:09:41 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        -10.8956,
        39.8881
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c100c920009f0bf0c",
      "age": 20,
      "eyeColor": "brown",
      "name": "Imelda Mays",
      "gender": "female",
      "company": "APEXTRI",
      "email": "imeldamays@apextri.com",
      "phone": "+1 (820) 413-3920",
      "address": "986 Sumpter Street, Bordelonville, Pennsylvania, 8160",
      "about": "Incididunt dolor anim nostrud tempor Lorem eiusmod aliquip aliquip excepteur ut nisi non reprehenderit ea. Cupidatat pariatur labore qui amet ullamco ad cupidatat et do nulla aliqua esse ipsum. Ex dolor nisi laboris officia eu officia officia exercitation ipsum mollit ullamco aliquip nostrud. Cillum nisi est dolore deserunt consectetur nulla. Voluptate adipisicing magna quis labore minim aute quis. Labore in ea non amet sint reprehenderit incididunt aliquip ipsum ex culpa Lorem reprehenderit.\r\n",
      "features": [],
      "postalCode": 94657,
      "registered": "2015-06-28T07:05:18 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        14.2269,
        -8.819
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c81c900fd4256cf6c",
      "age": 23,
      "eyeColor": "green",
      "name": "Freida Fox",
      "gender": "female",
      "company": "PORTALINE",
      "email": "freidafox@portaline.com",
      "phone": "+1 (942) 448-3476",
      "address": "549 Pierrepont Place, Fedora, California, 8163",
      "about": "Non aliquip voluptate ea cillum minim excepteur. Dolor dolor adipisicing mollit magna aute reprehenderit exercitation occaecat non. In esse ut fugiat ullamco et pariatur aliqua. Est occaecat duis sunt nulla non amet irure. Anim Lorem cillum dolore aliquip. Do tempor sit minim ullamco laboris tempor.\r\n",
      "features": [
        "Otherway",
        "Matrixity"
      ],
      "postalCode": 89151,
      "registered": "2014-12-09T12:38:31 +08:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        87.6098,
        0.3956
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007cae87ef02fdc225bb",
      "age": 25,
      "eyeColor": "brown",
      "name": "Herman Sykes",
      "gender": "male",
      "company": "ANOCHA",
      "email": "hermansykes@anocha.com",
      "phone": "+1 (994) 417-2483",
      "address": "761 Langham Street, Valmy, Maine, 9147",
      "about": "Duis culpa ullamco laborum officia reprehenderit mollit do. Culpa sint sunt consectetur sunt. Cupidatat irure aliqua occaecat minim ipsum aliqua adipisicing ad aliquip aliquip irure. Anim aute anim aliquip velit veniam laboris laborum nulla qui officia elit sunt dolore. Officia elit in incididunt consequat id. Pariatur in mollit et Lorem.\r\n",
      "features": [
        "Biohab",
        "Aquasseur",
        "Velos",
        "Confrenzy",
        "Geekmosis",
        "Intrawear",
        "Silodyne"
      ],
      "postalCode": 83245,
      "registered": "2016-03-24T10:30:06 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        30.4162,
        -7.4336
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c312ef43691a99069",
      "age": 30,
      "eyeColor": "blue",
      "name": "Molly Joyner",
      "gender": "female",
      "company": "TETRATREX",
      "email": "mollyjoyner@tetratrex.com",
      "phone": "+1 (886) 576-3988",
      "address": "915 Campus Road, Virgie, Oregon, 5006",
      "about": "Commodo esse excepteur occaecat nisi eu. Veniam laborum anim officia dolor adipisicing cupidatat cupidatat cupidatat non consequat. Eiusmod aliquip magna do velit quis incididunt sit. Nulla deserunt dolore adipisicing enim ut veniam deserunt reprehenderit veniam exercitation consequat aute qui fugiat.\r\n",
      "features": [
        "Enaut",
        "Izzby",
        "Multiflex"
      ],
      "postalCode": 86645,
      "registered": "2015-09-21T07:49:30 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        93.4537,
        -11.4799
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007cd0dc2e69dfbf6e34",
      "age": 32,
      "eyeColor": "green",
      "name": "Marci Ramirez",
      "gender": "female",
      "company": "EVEREST",
      "email": "marciramirez@everest.com",
      "phone": "+1 (814) 402-2246",
      "address": "913 Celeste Court, Hamilton, Georgia, 1117",
      "about": "Officia irure eu ex ut consequat voluptate qui culpa dolore. Eu laboris eu ut amet. Duis quis sunt laboris fugiat esse eu sint cupidatat sunt eiusmod cillum aliqua exercitation. Enim enim esse officia irure. Pariatur Lorem dolore labore ea ad ex eu quis et.\r\n",
      "features": [
        "Plasmos",
        "Motovate",
        "Talkalot",
        "Eplosion",
        "Comvoy"
      ],
      "postalCode": 98457,
      "registered": "2014-03-06T09:56:03 +08:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        -37.9796,
        22.4324
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007ca678540e7d38a3e0",
      "age": 32,
      "eyeColor": "blue",
      "name": "Carissa Rodriquez",
      "gender": "female",
      "company": "ACUSAGE",
      "email": "carissarodriquez@acusage.com",
      "phone": "+1 (908) 547-2534",
      "address": "966 Clifford Place, Southmont, Northern Mariana Islands, 8454",
      "about": "Sint ut officia pariatur sint elit et qui aliqua commodo quis dolor cillum. Nulla ex consequat ullamco nisi deserunt laboris velit eu. Laborum adipisicing quis mollit duis ea velit ut consequat. Irure eiusmod magna aliquip adipisicing velit et ex ex elit aliquip amet ea nulla occaecat. Nisi deserunt fugiat aliquip proident et ea. Pariatur amet ullamco duis elit elit velit laborum mollit eiusmod culpa. Eu occaecat ea minim exercitation culpa.\r\n",
      "features": [
        "Manglo",
        "Bittor",
        "Suretech",
        "Glukgluk",
        "Octocore",
        "Balooba"
      ],
      "postalCode": 93655,
      "registered": "2015-04-21T12:30:37 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        99.4025,
        19.9252
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c4893d5626a8de0f7",
      "age": 22,
      "eyeColor": "green",
      "name": "Albert Callahan",
      "gender": "male",
      "company": "IMPERIUM",
      "email": "albertcallahan@imperium.com",
      "phone": "+1 (897) 445-2143",
      "address": "993 Kensington Walk, Selma, Nevada, 8889",
      "about": "Ea id sit aute ex Lorem magna laboris labore exercitation. Elit officia deserunt quis dolore. Mollit cupidatat id veniam occaecat anim duis ipsum exercitation ullamco proident labore reprehenderit officia. Velit culpa anim eu tempor cupidatat consequat reprehenderit. Mollit exercitation consequat id in mollit id consectetur veniam laboris enim fugiat. Nostrud non non consectetur et proident duis.\r\n",
      "features": [
        "Zenolux",
        "Megall",
        "Updat",
        "Danja"
      ],
      "postalCode": 81447,
      "registered": "2014-02-17T02:40:27 +08:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        -7.3432,
        36.7358
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007ca71c9337b1a51973",
      "age": 25,
      "eyeColor": "brown",
      "name": "Mcintyre Hernandez",
      "gender": "male",
      "company": "KNEEDLES",
      "email": "mcintyrehernandez@kneedles.com",
      "phone": "+1 (842) 480-3976",
      "address": "931 Sunnyside Court, Stagecoach, Delaware, 8514",
      "about": "Ea pariatur ullamco fugiat deserunt proident fugiat magna adipisicing labore reprehenderit id veniam. Quis eu adipisicing excepteur minim sint aliqua ad consectetur. Aute laborum tempor veniam sint est culpa eiusmod. Adipisicing do sunt irure ex aliquip officia consequat elit qui. Exercitation laborum anim qui ut. Occaecat ipsum do veniam Lorem. Sunt cillum aute ad adipisicing culpa exercitation pariatur.\r\n",
      "features": [],
      "postalCode": 96343,
      "registered": "2015-10-13T08:16:39 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        49.0278,
        37.3888
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c354c56cf2b11ea28",
      "age": 26,
      "eyeColor": "brown",
      "name": "Mckay Berg",
      "gender": "male",
      "company": "ROTODYNE",
      "email": "mckayberg@rotodyne.com",
      "phone": "+1 (951) 475-2226",
      "address": "463 Florence Avenue, Foscoe, North Dakota, 5100",
      "about": "Lorem nulla in sint fugiat non dolore cillum. Culpa veniam et eiusmod exercitation proident enim fugiat sint cillum velit qui. Pariatur voluptate enim laboris cupidatat labore adipisicing ipsum fugiat ea irure tempor proident. Commodo occaecat ad irure duis nulla velit aliquip. Ullamco sunt duis cupidatat cupidatat labore adipisicing enim voluptate nulla aute. Nisi non pariatur est fugiat esse est irure officia.\r\n",
      "features": [],
      "postalCode": 86146,
      "registered": "2014-05-10T02:47:50 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        46.3575,
        1.4008
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c0660b9e77765dc21",
      "age": 31,
      "eyeColor": "brown",
      "name": "Barnes Rush",
      "gender": "male",
      "company": "BYTREX",
      "email": "barnesrush@bytrex.com",
      "phone": "+1 (993) 433-3825",
      "address": "347 Oxford Walk, Yardville, Wisconsin, 5838",
      "about": "Eiusmod sunt cupidatat magna adipisicing velit cupidatat occaecat excepteur labore commodo sunt. Excepteur occaecat Lorem qui dolor qui aliquip aliquip velit voluptate ullamco ut ad. Nisi proident mollit ex reprehenderit enim. Nisi esse proident aliquip elit amet et est officia quis sint nulla proident quis. Sint ut ullamco ullamco ullamco consequat labore Lorem commodo ut enim id voluptate qui. Tempor sit laborum magna ex aliqua. Tempor mollit cillum deserunt pariatur elit et.\r\n",
      "features": [
        "Kinetica",
        "Quarx",
        "Applica"
      ],
      "postalCode": 99551,
      "registered": "2014-01-26T04:30:41 +08:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        -14.3925,
        -14.6707
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007ce2a5e93b4f27ca8e",
      "age": 20,
      "eyeColor": "green",
      "name": "Goff Cotton",
      "gender": "male",
      "company": "ETERNIS",
      "email": "goffcotton@eternis.com",
      "phone": "+1 (955) 451-3114",
      "address": "622 Tampa Court, Escondida, Texas, 8001",
      "about": "Dolor aliqua proident ea dolor sit. Non aute commodo in deserunt aliquip. Sit ad nulla ad tempor ad fugiat eu esse aliquip eiusmod veniam quis. Ullamco excepteur cupidatat sint sint occaecat aliquip id sint adipisicing aute adipisicing cupidatat nostrud. Cupidatat aliquip ipsum enim ex anim ad excepteur duis deserunt commodo dolore.\r\n",
      "features": [
        "Zytrek",
        "Apex",
        "Fanfare"
      ],
      "postalCode": 93147,
      "registered": "2014-06-21T10:52:00 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        76.1249,
        35.3521
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007cd05ef289f5de7f71",
      "age": 21,
      "eyeColor": "green",
      "name": "Carlson Macdonald",
      "gender": "male",
      "company": "STOCKPOST",
      "email": "carlsonmacdonald@stockpost.com",
      "phone": "+1 (953) 410-3411",
      "address": "912 Withers Street, Belmont, Puerto Rico, 7550",
      "about": "Quis aute amet excepteur excepteur dolor officia eiusmod. Ad anim excepteur fugiat nostrud sunt eu aute esse aute aliquip occaecat irure ea. Velit consectetur exercitation deserunt consectetur commodo incididunt dolore. Id sunt adipisicing pariatur occaecat incididunt fugiat sint laborum labore quis fugiat duis amet in. In eu tempor et deserunt dolore labore aute id reprehenderit nostrud dolore nulla occaecat. Velit dolor labore mollit tempor fugiat nisi cillum cillum ipsum aliqua. Sunt magna laborum ex sint exercitation ea ullamco ex dolore eu dolor ipsum irure.\r\n",
      "features": [
        "Callflex"
      ],
      "postalCode": 85951,
      "registered": "2014-10-07T11:49:05 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        2.9675,
        -9.0316
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c9712b5fbd4db3cf2",
      "age": 27,
      "eyeColor": "brown",
      "name": "Delgado Kelley",
      "gender": "male",
      "company": "WAAB",
      "email": "delgadokelley@waab.com",
      "phone": "+1 (967) 491-2115",
      "address": "158 Mill Street, Healy, West Virginia, 2697",
      "about": "Tempor ullamco aliquip minim esse proident cupidatat eiusmod non esse consectetur. Veniam proident veniam consectetur nisi magna labore. Pariatur deserunt sit est nostrud ipsum id anim nostrud ex adipisicing. Labore incididunt incididunt mollit sint mollit aliqua pariatur laborum duis eiusmod proident. Eu pariatur cillum eu commodo.\r\n",
      "features": [
        "Digitalus",
        "Voratak"
      ],
      "postalCode": 83345,
      "registered": "2014-07-26T12:42:02 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        0.7979,
        -7.0343
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c467d7bf6deed1ea8",
      "age": 34,
      "eyeColor": "green",
      "name": "Blackburn Boyd",
      "gender": "male",
      "company": "CENTREE",
      "email": "blackburnboyd@centree.com",
      "phone": "+1 (910) 488-3085",
      "address": "250 Burnett Street, Cherokee, Colorado, 1369",
      "about": "Commodo non dolor cupidatat dolore Lorem sunt consectetur cillum tempor ipsum enim magna. Non ullamco aliquip dolore laboris aute tempor magna ut ullamco elit reprehenderit anim. Ea cupidatat Lorem anim consectetur. Nostrud velit et in laborum velit magna do tempor minim labore exercitation laborum. Do nulla nulla cillum nostrud proident officia duis dolore quis commodo ut duis esse. Mollit consequat Lorem irure tempor labore ad aute anim.\r\n",
      "features": [
        "Photobin",
        "Plasmosis"
      ],
      "postalCode": 88950,
      "registered": "2015-07-01T09:45:12 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        93.2745,
        -18.5081
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c5f1f02e752634a0a",
      "age": 33,
      "eyeColor": "brown",
      "name": "Britney Wolf",
      "gender": "female",
      "company": "GRAINSPOT",
      "email": "britneywolf@grainspot.com",
      "phone": "+1 (862) 485-3568",
      "address": "735 Clarkson Avenue, Morriston, Utah, 3610",
      "about": "Velit incididunt sunt ex enim ex excepteur excepteur proident. Voluptate aliqua cillum officia pariatur aute velit anim. Commodo ullamco ad sunt voluptate enim ullamco laborum cillum esse. Minim veniam magna quis ea magna.\r\n",
      "features": [
        "Boilicon",
        "Digique",
        "Comfirm",
        "Neurocell",
        "Biolive",
        "Portico"
      ],
      "postalCode": 83745,
      "registered": "2015-10-01T08:11:25 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        -2.1341,
        -13.3934
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007c53b840064c368433",
      "age": 21,
      "eyeColor": "green",
      "name": "Emily Mason",
      "gender": "female",
      "company": "MICRONAUT",
      "email": "emilymason@micronaut.com",
      "phone": "+1 (914) 427-3910",
      "address": "967 Eastern Parkway, Crisman, Montana, 9511",
      "about": "Est consectetur reprehenderit ex elit ea eu consequat quis nostrud ipsum excepteur consequat dolore. Consequat ullamco eiusmod ut fugiat commodo nisi pariatur minim dolor duis anim cillum do voluptate. Ullamco aute cillum voluptate eiusmod minim cupidatat nisi. Proident deserunt sit cupidatat pariatur amet consequat incididunt nulla aliquip reprehenderit deserunt cillum. Enim est adipisicing cillum nulla. Magna ad pariatur eu incididunt occaecat. Mollit fugiat et ea eu consectetur Lorem.\r\n",
      "features": [
        "Phormula",
        "Verbus",
        "Letpro",
        "Plasto",
        "Qot"
      ],
      "postalCode": 85048,
      "registered": "2015-06-26T08:27:49 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        27.2485,
        31.8102
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007cef8a191751e5a12e",
      "age": 30,
      "eyeColor": "blue",
      "name": "Ursula Skinner",
      "gender": "female",
      "company": "BUGSALL",
      "email": "ursulaskinner@bugsall.com",
      "phone": "+1 (865) 472-2799",
      "address": "563 Quincy Street, Grantville, South Carolina, 4869",
      "about": "Proident exercitation velit do mollit cupidatat cillum sint. Adipisicing dolor eiusmod nostrud fugiat cillum aliquip duis minim laborum ullamco adipisicing exercitation excepteur. Mollit officia ipsum sit eiusmod. Incididunt adipisicing dolor labore sunt sint cillum consectetur reprehenderit duis adipisicing nisi sit. Veniam fugiat sint ullamco laborum magna ex ullamco.\r\n",
      "features": [
        "Flyboyz"
      ],
      "postalCode": 87643,
      "registered": "2014-05-06T09:20:41 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        -7.2014,
        42.1231
      ]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "_id": "5788007ce67074149f4a6b80",
      "age": 33,
      "eyeColor": "green",
      "name": "Madeleine Garrison",
      "gender": "female",
      "company": "LIQUIDOC",
      "email": "madeleinegarrison@liquidoc.com",
      "phone": "+1 (883) 555-3107",
      "address": "649 Conduit Boulevard, Robinson, Rhode Island, 6473",
      "about": "Esse irure aliqua deserunt labore labore consequat. Tempor occaecat sunt tempor enim nisi aute magna. Excepteur tempor tempor deserunt aliqua veniam est anim minim cupidatat.\r\n",
      "features": [
        "Sureplex",
        "Puria",
        "Skybold",
        "Earbang",
        "Elemantra"
      ],
      "postalCode": 84945,
      "registered": "2014-07-02T06:30:52 +07:00"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        14.3904,
        -16.0839
      ]
    }
  }
]

var fc = {
  type: "FeatureCollection",
  "features": features
};
var message = features.length + " results found.";
var response = {
  message: message,
  results: fc
};

response;

function IsLeft(pt1, pt2, pt3)
{
    // Teste si point pt3 est à gauche/sur/à droite de la droite pt1-pt2.
    // Result > 0 si pt3 est à gauche de la droite pt1-pt2
    //         = 0 si le point est sur la droite
    //         < 0 ... droite
    // NB: surface du triangle = (Isleft / 2)
    // Chaque point défini par ses coordonnées X,Y
    return ((pt2['x'] - pt1['x']) * (pt3['y'] - pt1['y'])) - ((pt3['x'] - pt1['x']) * (pt2['y'] - pt1['y']));
}

function IsInsideTriangle(A, B, C, H)
{
    // Teste si point H est intérieur au Triangle ABC.
    // Méthode: Test si H et C sont a gauche de AB, ou pas, mais en meme temps
    return ((IsLeft(C, A, H) * IsLeft(C, A, B)) > 0 && (IsLeft(A, B, H) * IsLeft(A, B, C)) > 0 && (IsLeft(C, B, H) * IsLeft(C, B, A)) > 0);
}

function ksort(obj){
    var keys = Object.keys(obj).sort(), sortedObj = {};

    for(var i in keys) {
        sortedObj[keys[i]] = obj[keys[i]];
    }

    return sortedObj;
}

function addTriangle(triangles) {
    var npt_i = cpti + 1; // Index du point suivant 1
    var lpt_i = cpti + 2; // Index du point suivant 2
    apts_c = available_pts.length; // Index du point suivant 2

    // Vérifie si les index sont valables, sinon: retour au début de l'array this->>available_pts.
    if (cpti + 2 >= apts_c) {
        if (cpti + 2 === apts_c) {
            lpt_i = 0;
        } else if (cpti + 1 === apts_c) {
            npt_i = 0;
            lpt_i = 1;
        } else if (cpti === apts_c) {
            cpti = 0;
            npt_i = 1;
            lpt_i = 2;
        } else if (cpti - 1 === apts_c) {
            cpti = 0;
            npt_i = 1;
            lpt_i = 2;
        }
    }

    //echo "apts_c: " . apts_c . ", cpti: cpti, npti: npt_i, lpti: lpt_i >>> ";

    var cpt = available_pts[cpti]; // Point focus actuel
    var npt = available_pts[npt_i]; // Point suivant 1
    var lpt = available_pts[lpt_i]; // Point suivant 2
    var delta_x = lpt['x'] - cpt['x']; // Delta des absicces des deux premiers points
    var isdtx_ok = false;

    //var_dump(cpt);
    //var_dump(lpt);

    var ok = false;
    if (delta_x === 0) { // Cas de la pente verticale entre le premier et le deuxième point
        //echo "VERT. ~ ";
        if (npt['y'] > cpt['y']) { // En montée
            isdtx_ok = (lpt['x'] > cpt['x']);
            //echo "M " . intval(isdtx_ok);
        } else if (npt['y'] < cpt['y']) { // En descente
            isdtx_ok = (lpt['x'] < cpt['x']);
            //echo "D " . intval(isdtx_ok);
        } else {
            isdtx_ok = false;
        }
        //echo ">>> ";
    } else { // Pente normale
        var slope = (lpt['y'] - cpt['y']) / (lpt['x'] - cpt['x']);

        if (lpt['x'] - cpt['x'] > 0) { // Si on avance
            //movement = "A";
            var diff = npt['x'] - cpt['x'];
            var image = slope * diff; // Image en f(npt['x'])
            var toCompare = npt['y'] - cpt['y'];
            ok = (image < toCompare);
        } else { // Si on recule
            //movement = "R";
            var diff = npt['x'] - lpt['x'];
            var image = slope * diff; // Image en f(npt['x'])
            var toCompare = npt['y'] - lpt['y'];
            ok = (image > toCompare);
        }
        //echo "NORM. movement slope: " . this->format(slope) . ", img: " . this->format(image) . ", toCompare: " . <this->format(toCompare) . " >>> ";
    }

    //var_dump(abs(lpt['x'] - cpt['x']));

    if ((delta_x !== 0 && ok) || (delta_x === 0 && isdtx_ok)) { // Si le segment [pt1-pt3] n'est pas en dehors de l'air
        var issetPointInside = false;
        for (var i = 0; i < apts_c; i++) {
            if (IsInsideTriangle(cpt, npt, lpt, available_pts[i])) { // Si un des points est dans le triangle
                issetPointInside = true;
            }
        }
        if (!issetPointInside) { // S'il n'y a pas de point dans le triangle
            var a = Math.sqrt(Math.pow((npt['x'] - cpt['x']), 2) + Math.pow((npt['y'] - cpt['y']), 2)); // Côté adjacent
            var c = Math.sqrt(Math.pow((lpt['x'] - cpt['x']), 2) + Math.pow((lpt['y'] - cpt['y']), 2)); // Base du triangle
            var b = Math.sqrt(Math.pow((lpt['x'] - npt['x']), 2) + Math.pow((lpt['y'] - npt['y']), 2)); // Côté opposé

            triangles.push([[cpt['x'], cpt['y']], [npt['x'], npt['y']], [lpt['x'], lpt['y']]]);

            //angle_lpt = (b ** 2 + c ** 2 - a ** 2) / (2 * b * c);
            //angle_npt = (a ** 2 + b ** 2 - c ** 2) / (2 * a * b);
            var angle_cpt = (Math.pow(a, 2) + Math.pow(c, 2) - Math.pow(b, 2)) / (2 * a * c);

            var sin_angle_cpt = Math.sqrt(1 - Math.pow(angle_cpt, 2));

            var height = a * sin_angle_cpt;
            air += (height * c) / 2;
            //echo " <b style='color: green;'>V +airToAdd</b><br><br>";
            //var_dump(temp);
            //echo "<br><br>";

            for (i = npt_i; i + 1 < apts_c; i++) {
                available_pts[i] = available_pts[i + 1];
            }
            ksort(available_pts);
            available_pts.pop();
        } else {
            //echo " <b style='color: red;'>X2</b>";
        }
    } else {
        //echo " <b style='color: red;'>X1</b>";
    }
    cpti++;
}

function parsePoints(points) {
    points.reverse();

    for (var i = 0; i < points.length; i++) {
        points[i] = {'x' : points[i][0], 'y' : points[i][1]};
    }

    return points;
}

function getTriangle(i) {
    return triangles[i];
}

function countTriangles() {
    return triangles.length;
}

var available_pts = [];
var cpti = 0; // Index du points focus actuel
var apts_c = 0;
var air = 0; // Air finale
var triangles = [];

function getAir(points) {
    available_pts = parsePoints(points);

    while (available_pts.length >= 3) {
        addTriangle(triangles);
    }

    air = Math.round(air);
}
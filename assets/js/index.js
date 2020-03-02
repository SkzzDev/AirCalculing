function addCircle(draw, x, y) {
	var circle = draw.circle(8);
	circle.move(x - 4, y - 4);

	return circle;
}

function addStroke(draw) {
    return draw.line(0,0,0,0).stroke({ width: 1 });
}

function fillBgc(circle, points) {
	var attr = (points.length === 1) ? 'green' : '#f06';
	circle.attr({fill: attr});
}

function unsetElements(elements) {
	for (var i = 0; i < elements.length; i++) {
        elements[i].remove();
	}
	return elements;
}

function drawTriangle(draw, trianglePoints) {
    draw.polyline([[trianglePoints[0][0], trianglePoints[0][1]], [trianglePoints[1][0], trianglePoints[1][1]], [trianglePoints[2][0], trianglePoints[2][1]]]);
}

function drawTrianglesLoop(draw, i, trianglesCount) {
    setTimeout(function () {
        drawTriangle(draw, getTriangle(i));
        i++;
        if (i < trianglesCount) drawTrianglesLoop(draw, i, trianglesCount);
    }, 50);
}

function drawTriangles(draw) {
    var i = 0;
    var trianglesCount = countTriangles();

    drawTrianglesLoop(draw, i, trianglesCount);
}

$(document).ready(function() {

	// Set default SVG Canvas
	var draw = SVG('drawing').size(800, 800);
	
	var body = $("body"), canvas = $("#drawing");
	var canvasOffset = canvas.offset();
	var posX, posY;
	var elements = [];
	var points = [];
	var currentCircle = 0;
	var currentStroke = 0;
	var ended = false;

	$(canvas).click(function(event) {
		if (!ended) {
			posX = event.pageX - canvasOffset.left;
			posY = event.pageY - canvasOffset.top;
			points.push([posX, posY]);
			
			if (event.which === 1) {
				if (points.length > 1 && Math.abs(points[0][0] - posX) < 4 && Math.abs(points[0][1] - posY) < 4) {
                    points.shift();
                    for (var i = 0, points_string = ""; i < points.length; i++) points_string += "(" + points[i][0] + "," + points[i][1] + ")$";
                    points_string = points_string.substr(0, points_string.length - 1);

                    var t0 = performance.now();
                    getAir(points, triangles);
                    var t1 = performance.now();
                    var time = Number.parseFloat(t1 - t0).toFixed(1);

                    drawTriangles(draw);

                    $('p#air .value').text(air);
                    $('p#executionTime .value').text(time);
                    $('input#result').val(points_string);
					unsetElements(elements);
					ended = true;
				} else {
					currentCircle = addCircle(draw, posX, posY);
					elements.push(currentCircle);
					fillBgc(currentCircle, points);
					currentStroke = addStroke(draw);
					elements.push(currentStroke);
					$('p#points .value').text(points.length);
				}
			}
		}
	});

	$(canvas).mousemove(function(event) {
		if (!ended) {
			posX = event.pageX - canvasOffset.left;
			posY = event.pageY - canvasOffset.top;

            $('div#cursorPosition .x').text(posX);
            $('div#cursorPosition .y').text(posY);

			if (currentStroke !== 0) {
				currentStroke.plot(currentCircle.x() + 4, currentCircle.y() + 4, posX, posY)
			}
		}
	});
});
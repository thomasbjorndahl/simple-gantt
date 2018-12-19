(function ($, m) {
    var factory = function (options) {
        
        if (this && this[0]) {
            var opts = {
                lineColor: 'black',
                lineWidth: 1,
                margin: 5,
                scale: true,
                taskHeight: 60,
                taskSpacing: 10,
                taskContentHeight: 20,
                headingHeight: 50,
                drawTaskBoxes: true,
                drawYearLines: true,
                drawMonthLines: true,
                showMonthNames: true,
                showDescriptions: true,
                legends: true,
                taskColorGradients: true,
                showNowLine: true,
                nowLineColor: 'red',
                maxMonths: 30,
                taskTitle: {
                    font: "15px Arial",
                    color: 'black'
                },
                taskDescription: {
                    font: "11px Arial",
                    color: 'black'
                },
                heading: {
                    height: 60,
                    start: 250,
                    font: "12px Arial"
                },
                defaultColor: '#e0e0e0'
            };
            if (options) {
                $.extend(opts, options);
               
                
            }
            resize(this, opts); 
            var context = this[0].getContext('2d');
            draw(context, opts);
            context.stroke();
            return this;
        }
        
        

        function resize(el, opts) {
            
            if (opts.scale) {
                opts.actWidth = parseInt(el.parent().css('width'))-5;
                el.attr('width', opts.actWidth) ;
                if (opts.minHeight) {
                    opts.actHeight = opts.minHeight;                    
                }
                else {
                    opts.actHeight = parseInt(el.parent().css('height'));
                }
                if (opts.data && opts.data.Tasks) {
                    if (opts.actHeight < (opts.taskHeight * opts.data.Tasks.length) + opts.headingHeight + (opts.taskSpacing * opts.data.Tasks.length)) {
                        opts.actHeight = (opts.taskHeight * opts.data.Tasks.length) + opts.headingHeight + (opts.taskSpacing * opts.data.Tasks.length) + 100;
                    }
                }
                el.attr('height', opts.actHeight);

            }
            else {
                opts.actWidth = el.width;
            }
        }

        function draw(c, opts) {
            if (opts.data) {

                var y = opts.margin;
                c.strokeStyle = opts.lineColor;
                c.strokeWith = opts.lineWidth;
                drawHeading(c, opts, y);
                y = y + opts.heading.height;
                for (var i = 0; i < opts.data.Tasks.length; i++) {
                    var t = opts.data.Tasks[i];
                    t.y = y;
                    drawTask(c, t, opts);
                    y = y + opts.taskHeight + opts.taskSpacing;
                }
                if (opts.legends) {
                    drawLegends(c,opts);
                }
                if (opts.showNowLine) {
                    drawNowLine(c, opts);
                }
            }            
        }

        function drawHeading(c, opts, y) {
            c.font = opts.heading.font;
            
            var maxSpace = opts.actWidth - opts.heading.start;
            opts.daySpace = maxSpace / opts.data.TotalDays;
            
            var months = m(opts.data.End).diff(m(opts.data.Start), 'month');            
            var monthSpace = maxSpace / months;

            //Years
            c.fillText(m(opts.data.Start).year(), opts.heading.start, y + 30);
            opts.yearPositions = [];
            opts.yearPositions.push(opts.heading.start);
            
            opts.monthPositions = [];
            opts.monthPositions.push(opts.heading.start);
            var dt = m(opts.data.Start).day(1);
            var id = 0;
            var f = 'MMM';

            if (months > opts.maxMonths) {
                opts.showMonthNames = false;
            }

            if (monthSpace < 10) {
                f = 'SHORT';
            }
            else if (monthSpace > 100) {
                f = 'MMMM';
            }
            while (dt.diff(opts.data.End, 'days') < 0) {
                if (id > 0) {
                    var xm = opts.heading.start + (id - 1) * monthSpace;
                    
                    if (dt.month() === 0) {
                        opts.yearPositions.push(xm);
                        c.fillText(dt.year(), xm, y + 30);
                    }

                    if (opts.showMonthNames) {

                        if (monthSpace > 10 || (monthSpace < 10 && id % 3 === 0)) {
                            if (f === 'SHORT') {
                                var ms = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
                                c.fillText(ms[dt.month()], xm, y + 58);
                            } else {
                                c.fillText(dt.format(f), xm, y + 58);
                            }

                        }
                    }
                    
                    opts.monthPositions.push(xm);
                }
                dt = dt.add(1, 'M');
                id++;
            }
            
            
            c.stroke();

            
        }

        function drawTask(c, task, opts) {
            var x = opts.actWidth - opts.margin;

            if (opts.drawTaskBoxes) {
                

                if (opts.taskColorGradients) {                    
                    
                    var grd = c.createLinearGradient(0, 0, opts.actWidth - (opts.margin * 2) - 3, opts.taskHeight);
                    var gs = opts.defaultColor;

                    if (task.TaskType) {

                        if (opts.colors[task.TaskType]) {
                            gs = opts.colors[task.TaskType];
                        }
                    }
                    grd.addColorStop(0, gs);
                    grd.addColorStop(0.3, "white");
                    c.fillStyle = grd;
                    c.fillRect(opts.margin, task.y, opts.actWidth - (opts.margin * 2) - 3, opts.taskHeight);
                    c.fillStyle = null;
                }

                //Draw outer rectangle
                c.strokeStyle = opts.lineColor;
                c.strokeRect(opts.margin, task.y, opts.actWidth - (opts.margin * 2) - 3, opts.taskHeight);
            }

            //Write title
            c.font = opts.taskTitle.font;
            c.fillStyle = opts.taskTitle.color;
            c.fillText(task.Name, opts.margin + 5, task.y + 15);

            


            if (opts.drawYearLines) {

                //Adding year lines
                for (var i = 0; i < opts.yearPositions.length; i++) {
                    c.beginPath();
                    c.moveTo(opts.yearPositions[i], task.y);
                    c.lineTo(opts.yearPositions[i], task.y + opts.taskHeight);
                    c.lineWidth = 2;
                    c.strokeStyle = '#101010';
                    c.stroke();
                }
            }
            c.lineWidth = 1;
            if (opts.drawMonthLines) {
                //Drawing month lines
                var dt = m(opts.data.Start).day(1);
                var id = 1;
                while (dt.diff(opts.data.End, 'days') < 0) {
                    dt = dt.add(1,'M');
                    c.beginPath();
                    c.moveTo(opts.monthPositions[id], task.y);
                    c.lineTo(opts.monthPositions[id], task.y + opts.taskHeight);
                    c.strokeStyle = '#c9c9c9';
                    c.stroke();
                    id++;
                }
            }

            //Drawing the actual data
            var days = m(task.End).diff(task.Start, 'days');
            var dataX = 1 + opts.heading.start + m(task.Start).diff(opts.data.Start, 'days') * opts.daySpace;
            var dataY = task.y + (opts.taskContentHeight / 2);
            var dataL = days * opts.daySpace - opts.margin;
            var dataH = opts.taskHeight - ((opts.taskContentHeight / 2) * 2);

            if ((dataL + dataX + opts.margin) >= opts.actWidth) {
                dataL -= 5;
            }

            if (opts.colors) {
                var cl = opts.defaultColor;

                if (task.TaskType) {

                    if (opts.colors[task.TaskType]) {
                        cl = opts.colors[task.TaskType];
                        if (opts.legends) {
                            if (!opts.legendsList) {
                                opts.legendsList = [];
                            }
                            var addCurrent = true;
                            for (var k = 0; k < opts.legendsList.length; k++) {
                                if (opts.legendsList[k].text === task.TaskType) {
                                    addCurrent = false;
                                    break;
                                }
                            }
                            if (addCurrent) {
                                opts.legendsList.push({ cl: cl, text: task.TaskType });
                            }
                        }
                    }
                }

                c.fillStyle = cl;
                c.fillRect(dataX, dataY, dataL, dataH);

            } else {
                c.rect(dataX, dataY, dataL, dataH);
            }
            if (opts.showDescriptions) {
                c.font = opts.taskDescription.font;
                c.fillStyle = opts.taskDescription.color;                
                wrapText(c, task.Description, opts.margin + 5, task.y + 35, opts.heading.start - 3, 11);
            }
        }

        function drawNowLine(c, opts) {            
            
            var days = Math.abs(m(opts.data.Start).diff(m(), 'days'));
            c.beginPath();           
            c.moveTo(opts.heading.start + (days * opts.daySpace), opts.heading.height - 10);
            c.lineTo(opts.heading.start + (days * opts.daySpace), opts.taskHeight + (opts.taskHeight + opts.taskSpacing) * opts.data.Tasks.length);
            c.lineWidth = 2;
            c.strokeStyle = opts.nowLineColor;
            c.stroke();
        }

        function wrapText(c, text, x, y, maxWidth, lineHeight) {
            var words = text.split(' ');
            var line = '';

            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n] + ' ';
                var metrics = c.measureText(testLine);
                var testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    c.fillText(line, x, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                }
                else {
                    line = testLine;
                }
            }
            c.fillText(line, x, y);
        }

        function drawLegends(c, opts) {
            if (opts.legendsList) {
                for (var i = 0; i < opts.legendsList.length; i++) {
                    c.fillStyle = opts.legendsList[i].cl;
                    c.fillRect(opts.margin, (3 * i) + opts.margin + (5 * i), 5, 5);
                    c.fillText(capitalize(opts.legendsList[i].text), opts.margin + 10, (3 * i) + opts.margin + (5 * i) + 5);
                }
            }
        }

        function capitalize(text) {
            if (text.length > 0) {
                return text[0].toUpperCase() + text.substring(1);
            }
        }
    };
    factory.version = "1.0.0";
    $.fn.simpleGantt = factory;

}(jQuery, moment));
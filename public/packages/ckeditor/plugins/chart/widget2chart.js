﻿"undefined" !== typeof document.addEventListener && document.addEventListener("DOMContentLoaded", function () {
    "undefined" === typeof Chart ? "undefined" !== typeof console && console.log("ERROR: You must include chart.min.js on this page in order to use Chart.js") : [].forEach.call(document.querySelectorAll("div.chartjs"), function (a) {
        var e, f;
        e = "undefined" !== typeof chartjs_colors ? chartjs_colors : "undefined" !== typeof chartjs_colors_json ? JSON.parse(chartjs_colors_json) : {
            fillColor: "rgba(151,187,205,0.5)",
            strokeColor: "rgba(151,187,205,0.8)",
            highlightFill: "rgba(151,187,205,0.75)",
            highlightStroke: "rgba(151,187,205,1)",
            data: "#B33131 #B66F2D #B6B330 #71B232 #33B22D #31B272 #2DB5B5 #3172B6 #3232B6 #6E31B2 #B434AF #B53071".split(" ")
        };
        f = "undefined" !== typeof chartjs_config ? chartjs_config : "undefined" !== typeof chartjs_config_json ? JSON.parse(chartjs_config_json) : {
            Bar: {animation: !1},
            HorizontalBar: {animation: !1},
            Radar: {animation: !1},
            Doughnut: {animateRotate: !1},
            Line: {animation: !1},
            Pie: {animateRotate: !1},
            PolarArea: {animateRotate: !1}
        };
        var d = a.getAttribute("data-chart"), b = JSON.parse(a.getAttribute("data-chart-value"));
        if (b && b.length && d) {
            a.innerHTML = "";
            var c = document.createElement("canvas");
            c.height = a.getAttribute("data-chart-height");
            a.appendChild(c);
            var g = document.createElement("div");
            g.setAttribute("class", "chartjs-legend");
            a.appendChild(g);
            a = c.getContext("2d");
            c = new Chart(a);
            if ("bar" != d) for (a = 0; a < b.length; a++) b[a].color = e.data[a], b[a].highlight = e.data[a];
            if ("bar" == d || "line" == d) {
                var h = {
                    datasets: [{
                        label: "",
                        fillColor: e.fillColor,
                        strokeColor: e.strokeColor,
                        highlightFill: e.highlightFill,
                        highlightStroke: e.highlightStroke,
                        data: []
                    }], labels: []
                };
                for (a = 0; a < b.length; a++) b[a].value && (h.labels.push(b[a].label), h.datasets[0].data.push(b[a].value));
                g.innerHTML = ""
            }
            "bar" == d ? c.Bar(h, f.Bar) : "line" == d ? c.Line(h, f.Line) : g.innerHTML = "polar" == d ? c.PolarArea(b, f.PolarArea).generateLegend() : "pie" == d ? c.Pie(b, f.Pie).generateLegend() : c.Doughnut(b, f.Doughnut).generateLegend()
        }
    })
});

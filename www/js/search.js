/**
 * Search page.
 */

/*jslint browser: true, nomen: true, devel: true, white: true, indent: 4, maxlen: 120 */
/*global require, apartmentData, categoryData */

require(['jquery', //'underscore',
        'search/defines',
        'search/GraphManager'],

function ($, D, GraphManager) {
    "use strict";

    /**
     * On document load for the mangineer search page.
     */

    $(function () {

        var cats = D.exampleCategories, graphMan, data;

        /* Get the sensor/formula data embedded in the page. */
        if (categoryData !== undefined) {
            $.extend(true, cats, categoryData);
        } else {
            console.error("Could not find categoryData.");
        }

        data = GraphManager.makeCategories(cats);

        /* Get the apartment data embedded in the page. */
        if (apartmentData !== undefined) {
            data.apartments = apartmentData;
        } else {
            console.error("Could not find apartments... continuing with none.");
            data.apartments = [];
        }

        /* Use the mockdata stream instead. */
        if (typeof deboog !== 'undefined' && deboog) {
            D.uri.process = '/HomeWatch/search/mockdata.json'
        }

        graphMan = new GraphManager(D.sel.graphList, data);
        /* Have one initial graph control. */
        graphMan.add();

        /* Bind the "add new graph" button. */
        $(D.sel.addGraphButton).click(function (event) {
            event.preventDefault();
            graphMan.add();
        });

        /* Get rid of the "now loading..." placeholder. */
        $(D.sel.pageLoadingPlaceholder).remove();

    });
});

function addYItem() {
	for (i = 0; i < 10; i++) {
		if ($('select.yaxis'+i).is(":hidden")) {
			$('select.yaxis'+i).show();
			break;
		}
	}
}

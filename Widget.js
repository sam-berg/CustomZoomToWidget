define(['dojo/_base/declare', 'jimu/BaseWidget', 'dojo/parser', 'dijit/form/Select', "esri/tasks/QueryTask",
      "esri/tasks/query", "dojo/store/Memory", 'dojo/data/ObjectStore','dojo/_base/lang'],
function (declare, BaseWidget, parser, Select, QueryTask, Query, Memory, ObjectStore,lang) {
  //To create a widget, you need to derive from BaseWidget.

  m_sQueryURL = "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer/0";
  m_sQuery = "STATE_NAME = 'Maine'";
  m_sLabelField = "CITY_NAME";
  nZoomLevel = 12;
  m_sOutFields = "CITY_NAME", "STATE_NAME", "POP1990";

  return declare([BaseWidget], {
    // Custom widget code goes here 
	
    baseClass: 'jimu-widget-customwidget',
    
    //this property is set by the framework when widget is loaded.
     //name: 'CustomWidget',


//methods to communication with app container:

    // postCreate: function() {
    //   this.inherited(arguments);
    //   console.log('postCreate');
    // },

    startup: function() {
      this.inherited(arguments);
      parser.parse();
      console.log('startup');


      //query Maine towns
      //initialize query task
      
      queryTask = new QueryTask(m_sQueryURL);

      //initialize query
      query = new Query();
      query.returnGeometry = true;
      query.outFields = [m_sOutFields];
      query.returnGeometry = false;
      query.where = m_sQuery;

      var cmbSites = dijit.byId("cmbSites");

      cmbSites.on("change", lang.hitch(this, this.doZoomTo));

      queryTask.execute(query, function(featureSet){

        var resultStore = new Memory({
          data: []
        });

        var p = {};
        p.label = "(select a point of interest)";
        p.id = "(select a point of interest)";
        resultStore.data.push(p);

        for (var i = 0; i < featureSet.features.length; i++) {

          var g = featureSet.features[i];
          var s = g.attributes[m_sLabelField];
          var p = {};
          p.label = s;
          p.id = s;
          resultStore.data.push(p);

        }

        var os = new ObjectStore({ objectStore: resultStore });
        var cmb = dijit.byId("cmbSites");
        cmb.attr('store', os);
        cmb.startup();


      });

    },
    doZoomTo:function(){

      var sSiteID = dijit.byId('cmbSites').get('value');
      console.log("zoom to: " + sSiteID);

      queryTask = new QueryTask(m_sQueryURL);

      //initialize query
      query = new Query();
      query.returnGeometry = true;
      query.outFields = [m_sOutFields];
      query.returnGeometry = true;
      query.where = m_sLabelField + " = '" + sSiteID + "'" + " AND " + m_sQuery;

      queryTask.on("complete", lang.hitch(this, function (results) {

        g = results.featureSet.features[0];
        this.map.centerAndZoom(g.geometry, nZoomLevel);
        this.map.infoWindow.setFeatures([g]);
        this.map.infoWindow.setTitle(g.attributes[m_sLabelField]);
        this.map.infoWindow.show(g.geometry);


      }));

      queryTask.execute(query);


    }


    // onOpen: function(){
    //   console.log('onOpen');
    // },

    // onClose: function(){
    //   console.log('onClose');
    // },

    // onMinimize: function(){
    //   console.log('onMinimize');
    // },

    // onMaximize: function(){
    //   console.log('onMaximize');
    // },

    // onSignIn: function(credential){
    //   /* jshint unused:false*/
    //   console.log('onSignIn');
    // },

    // onSignOut: function(){
    //   console.log('onSignOut');
    // }
      
    // onPositionChange: function(){
    //   console.log('onPositionChange');
    // },

    // resize: function(){
    //   console.log('resize');
    // }

//methods to communication between widgets:

  });
});
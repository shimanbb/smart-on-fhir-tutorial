(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      if (smart.hasOwnProperty('patient')) {
        var patient = smart.patient;
        var pt = patient.read();
        
        console.log('patient:', patient, 'pt:', pt);
        
        
        var obv = smart.patient.api.fetchAll({
                    type: 'Observation',
                    query: {
                      code: {
                        $or: ['http://loinc.org|8302-2', 'http://loinc.org|8462-4',
                              'http://loinc.org|8480-6', 'http://loinc.org|2085-9',
                              'http://loinc.org|2089-1', 'http://loinc.org|55284-4']
                      }
                    }
                  });

        $.when(pt, obv).fail(onError);

        $.when(pt, obv).done(function(patient, obv) {
          var byCodes = smart.byCodes(obv, 'code');
          var gender = patient.gender;

          var fname = '';
          var lname = '';

          if (typeof patient.name[0] !== 'undefined') {
            fname = patient.name[0].given.join(' ');
            lname = patient.name[0].family;
          }

          var height = byCodes('8302-2');
          var systolicbp = getBloodPressureValue(byCodes('55284-4'),'8480-6');
          var diastolicbp = getBloodPressureValue(byCodes('55284-4'),'8462-4');
          var hdl = byCodes('2085-9');
          var ldl = byCodes('2089-1');

          var p = defaultPatient();
          p.birthdate = patient.birthDate;
          p.gender = gender;
          p.fname = fname;
          p.lname = lname;
          p.height = getQuantityValueAndUnit(height[0]);

          if (typeof systolicbp != 'undefined')  {
            p.systolicbp = systolicbp;
          }

          if (typeof diastolicbp != 'undefined') {
            p.diastolicbp = diastolicbp;
          }

          p.hdl = getQuantityValueAndUnit(hdl[0]);
          p.ldl = getQuantityValueAndUnit(ldl[0]);

          ret.resolve(p);
        });
		
		
		
		
		
		
		var goal = smart.patient.api.fetchAll({
                    type: 'Goal'
                    
                  });

        $.when(pt, goal).fail(onError);

        $.when(pt, goal).done(function(patient, goal) {
          var byCodes = smart.byCodes(goal, 'code');
          var gender = patient.gender;

          var i =0;
          var html = '';

          for(i = 0; i < goal.length; i++)
          {
              html = html + goal[i].text.div;
          }

          console.log(goal);

          $('#goals').html(html);
        });
		
		
		
		var carePlan = smart.patient.api.fetchAll({
                    type: 'CarePlan',
			query: {
				category: 'assess-plan'
                    	}
                    
                  });

        $.when(pt, carePlan).fail(onError);

        $.when(pt, carePlan).done(function(patient, carePlan) {
          var byCodes = smart.byCodes(carePlan, 'code');
          var gender = patient.gender;

		
		var i =0;
          var html = '';
          for(i = 0; i < 10; i++)
          {
              html = html + carePlan[i].text.div;
          }

		$('#careplan').html(html);
          console.log(carePlan);
        });
		
		
		
	var apt = smart.patient.api.fetchAll({
                    type: 'Appointment',
			query: {
                      patient: patient.id,
				date: {
					$and:['lt2030-01-14','gt2008-01-14']},
				status: 'booked'
                    }
                    
                  });

        $.when(pt, apt).fail(onError);

        $.when(pt, apt).done(function(patient, apt) {
          //var byCodes = smart.byCodes(apt, 'code');
          //var gender = patient.gender;

          var i =0;
          var html = '';

          /*for(i = 0; i < apt.length; i++)
          {
              html = html + goal[i].text.div;
          }*/

          console.log(apt);

          //$('').html(html);
        });	
		
		
		
		
		
      } else {
        onError();
      }
    }

    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  function defaultPatient(){
    return {
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      height: {value: ''},
      systolicbp: {value: ''},
      diastolicbp: {value: ''},
      ldl: {value: ''},
      hdl: {value: ''},
      goals:{value:''}
    };
  }

  function getBloodPressureValue(BPObservations, typeOfPressure) {
    var formattedBPObservations = [];
    BPObservations.forEach(function(observation){
      var BP = observation.component.find(function(component){
        return component.code.coding.find(function(coding) {
          return coding.code == typeOfPressure;
        });
      });
      if (BP) {
        observation.valueQuantity = BP.valueQuantity;
        formattedBPObservations.push(observation);
      }
    });

    return getQuantityValueAndUnit(formattedBPObservations[0]);
  }

  function getQuantityValueAndUnit(ob) {
    if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined' &&
        typeof ob.valueQuantity.unit != 'undefined') {
          return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
    } else {
      return undefined;
    }
  }

  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
    $('#height').html(p.height);
    $('#systolicbp').html(p.systolicbp);
    $('#diastolicbp').html(p.diastolicbp);
    $('#ldl').html(p.ldl);
    $('#hdl').html(p.hdl);
  };

})(window);

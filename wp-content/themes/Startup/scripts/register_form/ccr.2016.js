var CCR;
//the variable CCR (Camp Celtic Register) is holding all the functionality related to the register form
CCR = {
    //initializes the slider. We are using jquery.cycle.all.js. Note the after and before properties, which are bind to
    //our custom-made onAfter and onBefore functions. onBefore is more important, as it initializes the functionality of
    //each step of the form.
    initSlider:function () {
        CCR.sudoSlider = $("#slider").cycle({
            timeout:0,
            speed:150,
            fit:1,
            after:CCR.onAfter,
            before:CCR.onBefore
        });
    },
    //this enables the "Prev" and "Next" buttons. "Next" is a bit more elaborate, as it checks if all is valid before
    //going to the next page
    initNavigation:function () {
        $("#prev").bind("click", function () {
            CCR.hideErrors();
            $("#slider").cycle("prev");

        });
        $("#next").bind("click", function () {
            CCR.hideErrors();
            var currentStep;
            $(".step").each(function () {
                if ($(this).css("display") !== "none") {
                    currentStep = $(this).attr("id")
                }
            });
            var stepIsValid = CCR.validateStep(currentStep);
            if (stepIsValid) {
                $("#slider").cycle("next");
            }
        });
    },
    //addressCheck is used when validating addresses in step3 and ensures when postal then province or
    // when zip then state
    addressCheck:{
        postalOrZip:null,
        provinceOrState:null
    },
    validateStep:function (step) {
        var result = false;
        if (step === "step1") {
            result = CCR.validateStep1();
        }
        else if (step === "step2") {
            result = CCR.validateStep2();
        }
        else if (step === "step3") {
            result = CCR.validateStep3();
        }
        else if (step === "step4") {
            result = CCR.validateStep4();
        }
        else if (step === "step5") {
            result = CCR.validateStep5();
        }
        return result;
    },
    onAfter:function (curr, next, opts, fwd) {
        if (next.id === "step1" || next.id === "step6" || next.id === "step7") {
            $("#prev").css("visibility", "hidden");
        }
        else {
            $("#prev").css("visibility", "visible");
        }
        if (next.id === "step6" || next.id === "step7") {
            $("#next").css("visibility", "hidden");
        }
        else {
            $("#next").css("visibility", "visible");
        }
    },
    onBefore:function (curr, next, opts, fwd) {
        if(next.id === "step1"){
            CCR.initStep1Events();
        }
        if (next.id === "step2") {
            CCR.initStep2Display();
            CCR.initStep2Select();
            CCR.initStep2Events();
            $(".step2sessionOpts").each(function(){
            	var selector = "#" + $(this).attr("id") + " input:checkbox:checked";
                var $qsc = $(selector);
                CCR.step2RemoveCheckedFromSelect($qsc);
            });
        }
        if (next.id === "step6") {
            CCR.populateStep6();
        }
        if(next.id === "step7") {
            $("#register_instructions").hide();
        }
        else{
            $("#register_instructions").show();
        }
        var $ht = $(this).height();
        $(this).parent().animate({height:$ht, speed:50});
    },
    validateStep1:function () {
        var isSessionSelected = $("#step1Section1 input:checked").length +
            $("#step1Section2 input:checked").length +
            $("#step1Section5 input:checked").length +
            $("#step1Section3 input:checked").length +
            $("#step1Section4 input:checked").length;
        if (!isSessionSelected) {
            CCR.displayErrors("Please select at least one session above!");
            return false;
        }
//        else if ($("#step1Section3 input:checked").length && ($("#step1group3CoachName").val().length === 0)) {
//            CCR.displayErrors("Please enter Coach's Name");
//            return false;
//        }
        else {
            CCR.hideErrors();
            return true;
        }
    },
    validateStep2:function () {
        var step2TotalAllowedActivities = CCR.step2TotalAllowedActivities();
        if (step2TotalAllowedActivities) {
            var numActivities = $("#step2 input:checked").length;
            if (numActivities === 0 || numActivities !== step2TotalAllowedActivities) {
                CCR.displayErrors("Please choose the designated amount of activities per " +
                    "session plus an alternate activity for each session");
                return false;
            }
            else {
                CCR.hideErrors();
                return true;
            }
        }
        return true;
    },
    validateStep3:function () {
        var canAddress = (CCR.addressCheck.postalOrZip === "postal" && CCR.addressCheck.provinceOrState === "province");
        var usaAddress = (CCR.addressCheck.postalOrZip === "zip" && CCR.addressCheck.provinceOrState === "state");

        if (CCR.v.form() && (canAddress || usaAddress)) {
            CCR.hideErrors();
            return true;
        }
        else {
            CCR.displayErrors("Please correct the province/state and postal/zip code,  " +
                "it looks like one is Canadian and the other US.");
            return false;
        }
    },
    validateStep4:function () {
        if (CCR.v.form()) {
            return true;
        }
        else {
            return false;
        }
    },
    validateStep5:function () {
        if (CCR.v.form()) {
            return true;
        }
        else {
            return false;
        }
    },
    populateStep6:function () {
        //clear all previously generated Info:
        $(".step6generatedInfo").remove();
        CCR.populateCampSession();
        CCR.populateBusTransport();
        CCR.populateActivities();
        CCR.populateCamperInfo();
        CCR.populateHealthInfo();
        CCR.populateParentInfo();
        CCR.populateHiddenFields();

    },
    populateHiddenFields: function(){
        //clear all previously generated hidden fields:
        $("input[type='hidden']").not(".cartItems").remove();
        $(".step6generatedInfo").each(function(i){
            var parentID = $(this).parent().attr("id");
            var textID = ""
            if(parentID === "step6CampSessionConfirm"){
                textID = $(this).parent().attr("id") + "Text" + i;
            }
            else{
                textID = $(this).parent().attr("id") + "Text";
            }
            $("#register_form").append("<input type='hidden'" +
                " id='"+textID+"' name='"+textID+"' value='"+$(this).html().replace(/"|'/g, "`") +"'/>");
            /*$("#register_form").append("<input type='hidden'" +
                " id='"+textID+"' name='"+textID+"' value='"+$(this).html().replace(/"|'/g, "`").
                replace(/Session/g, "<br>Session") +"'/>");*/
        });
    },
    populateCampSession:function() {
        $("input[type='hidden'].cartItems").remove();

        //between March 1 and August 31 use higher price
        var today = new Date();
        var price = (today.getMonth() > 2 && today.getMonth() <= 7) || (today.getMonth() == 2 && today.getDate() > 1) ? 2 : 1;
        var total = 0.0;

        if($("#step1 input[name=step1group1]:checked").length !== 0){//Summer Camp
            var campSession = $("#step1 input[name=step1group1]:checked").siblings(".heading2").text();
            var campSessionOrdinal = "";
            $("#step1 input[name=step1group1]:checked").each(function () {
                var session = eval("onlinePrices.group1." + $(this).val().split(" ")[1]);
                var sessionName = session[0];
                var sessionPrice = session[price];
                total += parseFloat(sessionPrice);
                $("#register_form").append("<input type='hidden' class='cartItems' name='cartItem[]' value='" + sessionName + " " + campSession + "|" + sessionPrice + "' />");
                campSessionOrdinal += "<br/>" + sessionName + " ($" + sessionPrice + " + HST)";
                //campSessionOrdinal += "<br/>" + $(this).val().split(" ")[1].replace(/(\d)/g, " $1 ");
            });
            $("#step6CampSessionConfirm")
                .append("<div class='step6generatedInfo'><br/><div class='sessionHeader'>" + campSession + ":</div>" + campSessionOrdinal.replace(/^<br\/>/, "") + "</div>");
        }
        if($("#step1 input[name=step1group5]:checked").length !== 0){//Rookie Camp
            var campSession = $("#step1 input[name=step1group5]:checked").siblings(".heading2").text();
            var campSessionOrdinal = "";
            $("#step1 input[name=step1group5]:checked").each(function () {
                var session = eval("onlinePrices.group5." + $(this).val().split(" ")[1]);
                var sessionName = session[0];
                var sessionPrice = session[price];
                total += parseFloat(sessionPrice);
                $("#register_form").append("<input type='hidden' class='cartItems' name='cartItem[]' value='" + sessionName + " " + campSession + "|" + sessionPrice + "' />");
                campSessionOrdinal += "<br/>" + sessionName + " ($" + sessionPrice + " + HST)";
                //campSessionOrdinal += "<br/>" + $(this).val().split(" ")[1].replace(/(\d)/g, " $1 ");
            });
            $("#step6CampSessionConfirm")
                .append("<div class='step6generatedInfo'><br/><div class='sessionHeader'>" + campSession + ":</div>" + campSessionOrdinal.replace(/^<br\/>/, "") + "</div>");
        }
        if($("#step1 input[name=step1group2]:checked").length !== 0){//Leadership Camp
            var campSession = $("#step1 input[name=step1group2]:checked").siblings(".heading2").text();
            var campSessionOrdinal = "";
            $("#step1 input[name=step1group2]:checked").each(function () {
                var session = eval("onlinePrices.group2." + $(this).val().split(" ")[1]);
                var sessionName = session[0];
                var sessionPrice = session[price];
                total += parseFloat(sessionPrice);
                $("#register_form").append("<input type='hidden' class='cartItems' name='cartItem[]' value='" + sessionName + " " + campSession + "|" + sessionPrice + "' />");
                campSessionOrdinal += "<br/>" + sessionName + " ($" + sessionPrice + " + HST)";
                //campSessionOrdinal += "<br/>" + $(this).val().split(" ")[1].replace(/(\d)/g, " $1 ");
            });
            $("#step6CampSessionConfirm")
                .append("<div class='step6generatedInfo'><br/><div class='sessionHeader'>" + campSession + ":</div>" + campSessionOrdinal.replace(/^<br\/>/, "") + "</div>");
        }
        if($("#step1 input[name=step1group3]:checked").length !== 0){//Sports Camp
            var campSession = $("#step1 input[name=step1group3]:checked").siblings(".heading2").text();
            var campSessionOrdinal = "";
            $("#step1 input[name=step1group3]:checked").each(function () {
                var session = eval("onlinePrices.group3." + $(this).val().split(" ")[1]);
                var sessionName = session[0];
                var sessionPrice = session[price];
                total += parseFloat(sessionPrice);
                $("#register_form").append("<input type='hidden' class='cartItems' name='cartItem[]' value='" + sessionName + " " + campSession + "|" + sessionPrice + "' />");
                campSessionOrdinal += "<br/>" + sessionName + " ($" + sessionPrice + " + HST)";
                //campSessionOrdinal += "<br/>" + $(this).val().split(" ")[1].replace(/(\d)/g, " $1 ");
            });
            $("#step6CampSessionConfirm")
                .append("<div class='step6generatedInfo'><br/><div class='sessionHeader'>" + campSession + ":</div>" + campSessionOrdinal.replace(/^<br\/>/, "") + "</div>");
			var coachName = $("#step1group3CoachName").val();
			if(coachName !== ""){
				$("#step6CampSessionConfirm").append("<div class='step6generatedInfo'>Coach's Name: " + coachName + "</div>");
			}
        }
        if($("#step1 input[name=step1group4]:checked").length !== 0){//Backcountry Canoe Tripping
            var campSession = $("#step1 input[name=step1group4]:checked").siblings(".heading2").text();
            var campSessionOrdinal = "";
            $("#step1 input[name=step1group4]:checked").each(function () {
                var session = eval("onlinePrices.group4." + $(this).val().split(" ")[1]);
                var sessionName = session[0];
                var sessionPrice = session[price];
                total += parseFloat(sessionPrice);
                $("#register_form").append("<input type='hidden' class='cartItems' name='cartItem[]' value='" + sessionName + " " + campSession + "|" + sessionPrice + "' />");
                campSessionOrdinal += "<br/>" + sessionName + " ($" + sessionPrice + " + HST)";
                //campSessionOrdinal += "<br/>" + $(this).val().split(" ")[1].replace(/(\d)/g, " $1 ");
            });
            $("#step6CampSessionConfirm")
                .append("<div class='step6generatedInfo'><br/><div class='sessionHeader'>" + campSession + ":</div>" + campSessionOrdinal.replace(/^<br\/>/, "") + "</div>");
        }

        if(total > 0) {
            $("#step6CampSessionConfirm")
                .append("<div class='step6generatedInfo'><br/><div class='sessionHeader'>Total:</div>$" + (Math.round(total * 113) / 100) + " ($" + (Math.round(total * 100) / 100) + " + HST)</div>");
        }
    },
    populateBusTransport:function () {
        var busTransport = $("#step1 input[name=step1group6]:checked");
        var pickupDropoff = $("#step1 input[name=step1group7]:checked");
        var formattedOutput = "";
        if (busTransport.length) {
            $("#step6BusTransportationConfirm").prev(".solidBorder").show();
            $("#step6BusTransportationConfirm").show();
            busTransport.each(function () {
                formattedOutput += "<br/>" + $(this).val().split(" ")[1].replace(/from/, "From ")
                    .replace(/to/, "To ")
                    .replace(/(\d)/g, " $1 ");
            });
            pickupDropoff.each(function () {
                formattedOutput += "<br/>Pick-up/Drop-off: " + $(this).val().split(" ")[1];
            });
            $("#step6BusTransportationConfirm").append("<div class='step6generatedInfo'>" + formattedOutput + "</div>");
        } else {
            $("#step6BusTransportationConfirm").prev(".solidBorder").hide();
            $("#step6BusTransportationConfirm").hide();
        }
    },
    populateActivities:function () {
        if (CCR.step2Activities) {
            $("#step6ActivitiesConfirm").prev(".solidBorder").show();
            $("#step6ActivitiesConfirm").show();
            var displayActivities = "";
            $("#step2 div").each(function () {
                if ($(this).css("display") === "block" && !!$(this).attr("id")) {
                    var sessionID = "<br/><div class='sessionHeader'>" + $(this).attr("id").replace(/step\d/, "")
                        .replace(/(\d)/, " $1").replace(/session/, "Session") + ":&nbsp;</div>";
                    displayActivities += sessionID;
                    $(this).children("input:checkbox:checked").each(function () {
                        displayActivities += $(this).next().html() + "<br/>";
                    });
                    //strip the last breakline:
                    displayActivities.replace(/<br\/>$/, "");
                    displayActivities += "Alternate:" + $(this).children("select").children("option:selected").html() + "<br/>";
                }
            });
            $("#step6ActivitiesConfirm").append("<div class='step6generatedInfo'>" + displayActivities + "</div>");
        }
        else {
            $("#step6ActivitiesConfirm").prev(".solidBorder").hide();
            $("#step6ActivitiesConfirm").hide();
        }
    },
    populateCamperInfo:function () {
        var camperInfo = "";
        camperInfo += $("#step3FirstName").val() + " " + $("#step3LastName").val() + ", " +
            $("input[name='step3group1']:checked").val() + "<br/>";
        camperInfo += "Date of Birth: " + $("#step3DateOfBirth").val() + "<br/>";
        camperInfo += $("#step3Address1").val() + " " + $("#step3Address2").val();
        camperInfo += $("#step3City").val() + ", " + $("#step3Province").val() + "<br/>";
        camperInfo += $("#step3PostalCode").val() + ", " + $("select#step3Country option:selected").val() + "<br/>";
        camperInfo += "School attended: " + $("#step3SchoolAttended").val() + "<br/>";
        var cabinMateReq = $("#step3CabinMateRequested").val();
        if (cabinMateReq.length) {
            camperInfo += "Cabin Mate Requested: " + cabinMateReq;
        }
        $("#step6CamperInfoConfirm").append("<div class='step6generatedInfo'>" + camperInfo + "</div>");

    },
    populateHealthInfo:function () {
        var healthInfo = "";
        healthInfo += "Family Doctor: " + $("#step4FamilyDoctor").val() + "<br/>";
        healthInfo += "Doctor's phone: " + $("#step4FamilyDoctorTelephone").val() + "<br/>";
        healthInfo += "Health Card No.: " + $("#step4HealthCard\\#").val() + "<br/>";
        healthInfo += "Date of Last Tetanus Shot: " + $("#step4DateOfLastTetanusShot").val() + "<br/>";
        var medicalHistory = $("#step4MedicalHistory").val();
        if(medicalHistory.length){
            healthInfo += "Medical History: " + medicalHistory + "<br/>";
        }
        var AllergiesDisabilities = $("#step4AllergiesPhysicalDisabilities").val();
        if(AllergiesDisabilities.length){
            healthInfo += "Alergies, Physical Disabilities: " + AllergiesDisabilities + "<br/>";
        }
        var medications = $("#step4MedicationsTaken").val();
        if(medications.length){
            healthInfo += "Medications taken: " + medications + "<br/>";
        }
        $("#step6HealthInfoConfirm").append("<div class='step6generatedInfo'>" + healthInfo + "</div>");
    },
    populateParentInfo:function () {
        var parentInfo = "";
        parentInfo += $("#step5FirstName1").val() + " " + $("#step5LastName1").val() + "<br/>";
        var aparentName = $("#step5FirstName2").val();
        if(aparentName.length){
           parentInfo += $("#step5FirstName2").val() + " " + $("#step5LastName2").val() + "<br/>";
        }
        parentInfo += "Home phone 1: " + $("#step5HomeTelephone1").val() + "<br/>";
        var alterPhone1 = $("#step5AlternateTelephone1").val();
        if(alterPhone1.length){
            parentInfo += "Alternate phone 1: " + alterPhone1 + "<br/>";
        }
        var homePhone2 = $("#step5HomeTelephone2").val();
        if(homePhone2.length){
            parentInfo += "Home phone 2: " + homePhone2 + "<br/>";
        }
        var alterPhone2 = $("#step5AlternateTelephone2").val();
        if(alterPhone2.length){
            parentInfo += "Alternate phone 2: " + alterPhone2 + "<br/>";
        }
        parentInfo += "Email 1: " + $("#step5Email1").val() + "<br/>";
        var aemail = $("#step5Email2").val();
        if(aemail.length){
            parentInfo += "Email 2: " + aemail + "<br/>";
        }
        var additionalInfo = $("#step5AdditionalInfo").val();
        if(additionalInfo.length){
            parentInfo += "Additional Info: " + additionalInfo + "<br/>";
        }
        var referer = $("#step5HowDidYouHear").val();
        if(referer.length){
            parentInfo += "How did you hear about camp celtic: " + referer + "<br/>";
        }
        $("#step6ParentInfoConfirm").append("<div class='step6generatedInfo'>" + parentInfo + "</div>");
    },
    displayErrors:function (errorMessage) {
        $("#errors").show();
        $("#errors").html("");
        $("#errors").append(errorMessage);
    },
    hideErrors:function () {
        $("#errors").html("");
        $("#errors").hide();
        //hide also the validation plugin errors:
        $("#errorsList").hide();
    },
    initStep1Events:function () {
        //Step1 inputs are grouped:
        //Group 1 is Summer Camp
        //Group 5 is Rookie Camp
        //Group 2 is Leadership Camp
        //Group 3 is Sports Camp
        //Group 4 is Backcountry Canoe Tripping
        //Group 6 is bus transport

        //every time checkbox changes states in group1, this gets executed
        $("input:checkbox[name=step1group1]").change(function () {
            CCR.displayBusSectionGroup1 = false;
            var session6checked = 0;

            //for each checkbox in group
            $("input:checkbox[name=step1group1]").each(function () {
                if ($(this).attr("checked")) {
                    var busEnabledSectionsSelected = $(this).val().match(/session1/)? false:true;
                    CCR.displayBusSectionGroup1 |= busEnabledSectionsSelected;//Beware the bitwise OR assignment here :)
                    CCR.hideErrors();
                    //if session 2 or 3 selected, disable corresponding one in Leadership Camp:
                    if($(this).val().match(/session2/)){
                        var a = $("input:checkbox[name=step1group2]");
                        $(a[0]).attr("disabled", "disabled");
                    }
                    if($(this).val().match(/session3/)){
                        var a = $("input:checkbox[name=step1group2]");
                        $(a[1]).attr("disabled", "disabled");
                    }
                    //if session 6 selected, disable Backcountry Canoe Tripping option
                    if($(this).val().match(/session6/)){
                        $("input:checkbox[name=step1group4]").attr("disabled", "disabled");
                    }
                }
                else{
                    if($(this).val().match(/session2/)){
                        var a = $("input:checkbox[name=step1group2]");
                        $(a[0]).removeAttr("disabled");
                    }
                    if($(this).val().match(/session3/)){
                        var a = $("input:checkbox[name=step1group2]");
                        $(a[1]).removeAttr("disabled");
                    }
                    if($(this).val().match(/session6/)){
                        session6checked++;
                    }
                    CCR.clearStep2Selections($(this).val());
                }
            });
            if(session6checked === 1){
                $("input:checkbox[name=step1group4]").removeAttr("disabled");
            }
            CCR.toggleBusSection();
        });
        $("input:checkbox[name=step1group5]").change(function(){
          CCR.displayBusSectionGroup5 = false;
          CCR.toggleBusSection();
        });
        $("input:checkbox[name=step1group2]").change(function () {
            CCR.displayBusSectionGroup2 = false;
            $("input:checkbox[name=step1group2]").each(function () {
                if ($(this).attr("checked")) {
                    if($(this).val().match(/session2/)){
                        var a = $("input:checkbox[name=step1group1]");
                        $(a[1]).attr("disabled", "disabled");
                    }
                    if($(this).val().match(/session3/)){
                        var a = $("input:checkbox[name=step1group1]");
                        $(a[2]).attr("disabled", "disabled");
                    }
                    CCR.displayBusSectionGroup2 = true;
                    CCR.hideErrors();
                }
                else {
                    if($(this).val().match(/session2/)){
                        var a = $("input:checkbox[name=step1group1]");
                        $(a[1]).removeAttr("disabled");
                    }
                    if($(this).val().match(/session3/)){
                        var a = $("input:checkbox[name=step1group1]");
                        $(a[2]).removeAttr("disabled");
                    }
                }
            });
            CCR.toggleBusSection();
        });
        $("input:checkbox[name=step1group3]").change(function () {
            CCR.displayBusSectionGroup3 = false;
            var sportcamps = $("input:checkbox[name=step1group3]");
            sportcamps.each(function () {
                if ($(this).attr("checked")) {
                    if($(this).val().match(/volleyball/)){
                        $(sportcamps[0]).attr("disabled", "disabled");
                    }
                    if($(this).val().match(/basketball/)){
                        $(sportcamps[1]).attr("disabled", "disabled");
                    }
                    CCR.displayBusSectionGroup3 = true;
                    CCR.hideErrors();
                }
                else {
                    if($(this).val().match(/volleyball/)){
                        $(sportcamps[0]).removeAttr("disabled");
                    }
                    if($(this).val().match(/basketball/)){
                        $(sportcamps[1]).removeAttr("disabled");
                    }
                }
            });
            CCR.toggleBusSection();
        });
        $("input:checkbox[name=step1group4]").change(function(){
			CCR.displayBusSectionGroup4 = false;
			if($(this).attr("checked")){
				CCR.displayBusSectionGroup4 = true;
				//var summercamps = $("input:checkbox[name=step1group1]");
				//$(summercamps[5]).attr("disabled", "disabled");
				$('#step1Section1 input[value="group1 session6"]').attr("disabled", "disabled");
			}
			else{
				//var summercamps = $("input:checkbox[name=step1group1]");
				//$(summercamps[5]).removeAttr("disabled");
				$('#step1Section1 input[value="group1 session6"]').removeAttr("disabled");
			}
			CCR.toggleBusSection();
        });
        $("input:checkbox[name=step1group6]").change(function(){
			CCR.displayPickupDropoff = false;
            var sessions = $("input:checkbox[name=step1group6]");
            sessions.each(function () {
                if ($(this).attr("checked")) {
                    CCR.displayPickupDropoff = true;
                }
            });
			CCR.togglePickupDropoff();
        });

    },
    toggleBusSection:function(){
        if(CCR.displayBusSectionGroup1 || CCR.displayBusSectionGroup5 || CCR.displayBusSectionGroup2 ||
            CCR.displayBusSectionGroup3 || CCR.displayBusSectionGroup4){
            $("#step1Section6").fadeIn(10, function () {
                var $ht = $("#step1").height();
                $("#step1").parent().animate({height:$ht, speed:10});
            });
        }
        else{
            $("#step1Section6").fadeOut(150, function () {
                var $ht = $("#step1").height();
                $("#step1").parent().animate({height:$ht, speed:20});
            });
        }
    },
    togglePickupDropoff:function(){
        if(CCR.displayPickupDropoff){
            $("#step1Section7").fadeIn(10, function () {
                var $ht = $("#step1").height();
                $("#step1").parent().animate({height:$ht, speed:10});
            });
        }
        else{
            $("#step1Section7").fadeOut(150, function () {
                var $ht = $("#step1").height();
                $("#step1").parent().animate({height:$ht, speed:20});
            });
        }
    },
    initStep2Display:function () {
        $("#step2 div").hide();
        $("#step2notneeded").hide();
        $("input:checkbox[name=step1group1]:checked").each(function () {
            if ($(this).attr("value") === "group1 session1") {
                $("#step2session1, #step2session1 .heading2").show();
            }
            else if ($(this).attr("value") === "group1 session2") {
                $("#step2session2, #step2session2 .heading2").show();
            }
            else if ($(this).attr("value") === "group1 session3") {
                $("#step2session3, #step2session3 .heading2").show();
            }
            else if ($(this).attr("value") === "group1 session4") {
                $("#step2session4, #step2session4 .heading2").show();
            }
            else if ($(this).attr("value") === "group1 session6") {
                $("#step2session6, #step2session6 .heading2").show();
            }
//            else if ($(this).attr("value") === "group1 session7") {
//                $("#step2session7").show();
//            }
        });
        if($("input:checkbox[name=step1group1]:checked").length == 0 ){
            $("#step2notneeded").show();
            CCR.step2Activities = false;
        }
        else {
            CCR.step2Activities = true;
        }
    },
    initStep2Select:function () {
        $("#step2 select").remove();
        $("#step2 label").remove();
        var $step2div = $("#step2 div").not(".heading2");
        //for each session section:
        $step2div.each(function () {
            var $selectid = $(this).attr("id") + "select";
            var $inputArray = $('input', $(this));
            $(this).append("<label for='" + $selectid + "'>Alternate:</label>" +
                "<select name='" + $selectid + "' id='" + $selectid + "'></select>");
            $inputArray.each(function () {
                var $inputid = $(this).attr("value");
                var $select = $("select", $(this).parent());
                var $selectname = $inputid.replace(/session\d{1}/, "");
                $select.append("<option value='" + $inputid + "'>" + $selectname + "</option>");
            });
        });
    },
    initStep2Events:function () {
        CCR.step2firstRunCounter = 0;
        $("#step2 input:checkbox").change(function () {
            CCR.step2firstRun = CCR.step2TotalAllowedActivities();
            CCR.step2firstRunCounter++;

            var $qsc = $("#" + $(this).parent().attr("id") + " input:checkbox:checked");
            CCR.step2RemoveCheckedFromSelect($qsc);

            var $qsu = $("#" + $(this).parent().attr("id") + " input[type=checkbox]:not(:checked)");
            CCR.step2AddUncheckedToSelect($qsu);

            var activitiesLimit = $(this).attr("value").match(/session1|session4/g)? 2: 3;

            if ($qsc.length > activitiesLimit) {
                $qsu.attr("disabled", "disabled");
                if (CCR.step2firstRun < CCR.step2firstRunCounter) {
                    CCR.validateStep2();
                }
            }
            else if ($qsc.length < activitiesLimit + 1) {
                $qsu.removeAttr("disabled");
                if (CCR.step2firstRun < CCR.step2firstRunCounter) {
                    CCR.validateStep2();
                }
            }
        });
    },
    clearStep2Selections: function(sessionNum){
        if(sessionNum.match(/session1/)){
            $("#step2session1").find("input[type=checkbox]").each(function(){
               $(this).removeAttr("checked");
            });
        }
        else if(sessionNum.match(/session2/)){
            $("#step2session2").find("input[type=checkbox]").each(function(){
                $(this).removeAttr("checked");
            });
        }
        else if(sessionNum.match(/session3/)){
            $("#step2session3").find("input[type=checkbox]").each(function(){
                $(this).removeAttr("checked");
            });
        }
        else if(sessionNum.match(/session4/)){
            $("#step2session4").find("input[type=checkbox]").each(function(){
                $(this).removeAttr("checked");
            });
        }
        else if(sessionNum.match(/session5/)){
            $("#step2session5").find("input[type=checkbox]").each(function(){
                $(this).removeAttr("checked");
            });
        }
        else if(sessionNum.match(/session6/)){
            $("#step2session6").find("input[type=checkbox]").each(function(){
                $(this).removeAttr("checked");
            });
        }
        else if(sessionNum.match(/session7/)){
            $("#step2session7").find("input[type=checkbox]").each(function(){
                $(this).removeAttr("checked");
            });
        }

    },
    step2RemoveCheckedFromSelect:function($qsc){
        $qsc.each(function () {
            var $id = $(this).attr("value");
            var $selectoptions = $(this).siblings("select").children();
            $selectoptions.each(function () {
                if ($(this).attr("value") === $id) {
                    $(this).attr("disabled", "disabled");
                    if ($(this).attr("selected")) {
                        CCR.step2SelectAlternate($(this));
                        $(this).removeAttr("selected");
                    }
                }
            });
        });
    },
    step2SelectAlternate: function (option){
        if(option.next()){
            if(option.next().css("display") !== "none"){
                option.next().attr("selected", "selected");
            }
            else {
                CCR.step2SelectAlternate(option.next());
            }
        }
        else if(option.prev()){
            if(option.prev().css("display") !== "none"){
                option.prev().attr("selected", "selected");
            }
            else {
                CCR.step2SelectAlternate(option.prev());
            }
        }
    },
    step2AddUncheckedToSelect:function($qsu){
        $qsu.each(function () {
            var $id = $(this).attr("value");
            var $selectoptions = $(this).siblings("select").children();
            $selectoptions.each(function () {
                if ($(this).attr("value") === $id) {
                    $(this).removeAttr("disabled");
                }
            });
        });
    },
    step2TotalAllowedActivities:function () {
        var TotalAllowedActivities = 0;
        var iterator = $("#step2").find("div").not(".heading2");
        iterator.each(function () {
            if ($(this).css("display") !== "none") {
                if($(this).attr("id") === "step2session1" || $(this).attr("id") === "step2session4"){
                    TotalAllowedActivities +=3;
                }
                else {
                    TotalAllowedActivities +=4;
                }
            }
        });
        return TotalAllowedActivities;
    },

    step3SetCountry:function (country, identifier){
      if(country === "CA"){
          $("select#step3Country option:nth-child(2)").removeAttr("selected");
          $("select#step3Country option:nth-child(1)").attr("selected", "true");
      }
      else if(country === "US"){
          $("select#step3Country option:nth-child(1)").removeAttr("selected");
          $("select#step3Country option:nth-child(2)").attr("selected", "true");
      }

      if(identifier === "province" || identifier === "state"){
          CCR.addressCheck.provinceOrState = identifier;
      }
      else if(identifier === "postal" || identifier === "zip"){
          CCR.addressCheck.postalOrZip = identifier;
      }

      return true;
    },

    initValidate:function () {
        $.validator.addMethod(
            "province_or_state",
            function (value, element) {
                return this.optional(element) ||
                    CCR.regexProvince.test(value)? CCR.step3SetCountry("CA", "province"): CCR.regexStates.test(value)? CCR.step3SetCountry("US", "state"): false;
            },
            "Please enter a valid province/state name or abbreviation"
        );

        $.validator.addMethod(
            "postal_or_zip",
            function (value, element) {
                return this.optional(element) ||
                    CCR.regexPostalCode.test(value)? CCR.step3SetCountry("CA", "postal"):CCR.regexZIPCode.test(value)? CCR.step3SetCountry("US", "zip"):false;
            },
            "Please enter a valid postal/ZIP code"
        );


        $.validator.setDefaults({
            errorPlacement:function (error, element) {
                error.appendTo("#errorsList");
            },
            errorContainer:"#errorsList",
            errorLabelContainer:"#errorsList",
            wrapper:"li"
        });
        CCR.v = $("#register_form").validate({
            rules:{
                step3group1:{
                    required:true
                },
                step3DateOfBirth:{
                    required:true,
                    dateITA:true
                },
                step3Province:{
                    required:true,
                    province_or_state:true
                },
                step3PostalCode:{
                    required:true,
                    postal_or_zip:true
                },
                step4FamilyDoctorTelephone:{
                    required:false,
                    phoneUS:true
                },
                step4DateOfLastTetanusShot:{
                    required:false,
                    dateITA:true
                },
                step5HomeTelephone1:{
                    required:true,
                    phoneUS:true
                },
                step5Email1:{
                    required:true,
                    email:true
                }
            },
            messages:{
                step3group1:{
                    required:"Please specify: male or female camper"
                },
                step3DateOfBirth:{
                    required:"Date of Birth is required",
                    dateITA:"Date of Birth should be in dd/mm/yyyy format"
                },
                step3Province:{
                    required:"Province/State is required",
                    province_or_state: "Please enter a valid province/state"
                },
                step3PostalCode:{
                    required:"Postal/ZIP Code is required",
                    postal_or_zip:"Please enter a valid Postal/ZIP Code"
                },
                step4FamilyDoctorTelephone:{
                    required:"Family Doctor telephone is required",
                    phoneUS:"Please enter a valid phone number"
                },
                step4DateOfLastTetanusShot:{
                    required:"Date of last tetanus shot is required",
                    dateITA:"Please enter the date in dd/mm/yyyy format"
                },
                step5HomeTelephone1:{
                    required:"Home Telephone is required",
                    phoneUS:"Please enter a valid phone number"
                },
                step5Email1:{
                    required:"Email is required",
                    email:"Please enter a valid email address"
                }
            },
            submitHandler: function(form) {
				form.submit();
            }
        });
    },
    initRegexPatterns:function () {
        CCR.regexProvince = new RegExp("AB|ALB|Alta|Alberta|BC|CB|British Columbia|LB|Labrador|MB|Man|Manitoba|" +
            "Nfld|NF|Newfoundland|NWT|Northwest Territories|Nova Scotia|New Brunswick|Nunavut|ON|ONT|" +
            "Ontario|PE|PEI|IPE|Prince Edward Island|QC|PC|QUE|QU|Quebec|SK|Sask|Saskatchewan|YT|Yukon|" +
            "Yukon Territories", "i");
        CCR.regexStates = new RegExp("^(A[LKSZRAEP]|C[AOT]|D[EC]|F[LM]|G[AU]|HI|I[ADLN]|K[SY]|LA|M[ADEHINOPST]|" +
            "N[CDEHJMVY]|O[HKR]|P[ARW]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])$", "i");
        CCR.regexPostalCode = new RegExp("^(([ABCEGHJKLMNPRSTVXY]|[abceghjklmnprstvxy])\\d([ABCEGHJKLMNPRSTVWXYZ]|" +
            "[abceghjklmnprstvwxyz])(\\s|)\\d([ABCEGHJKLMNPRSTVWXYZ]|[abceghjklmnprstvwxyz])\\d)$");
        CCR.regexZIPCode = new RegExp("^\\d{5}(-\\d{4})?$");
    },
    gotoStep:function (stepNum) {
        while (stepNum < 6) {
            $("#slider").cycle("prev");
            stepNum++;
        }
    },
    showResponse: function(){
        $("#slider").cycle("next");
    }
};

//When page is loaded, this piece of code is executed, which calls several initialization functions
$(document).ready(function () {
    CCR.initSlider();
    CCR.initNavigation();
    CCR.initRegexPatterns();
    CCR.initValidate();
});
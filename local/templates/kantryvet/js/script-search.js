var Errors = {
    "result_unval": "Error in result",
    "result_empty": "Empty result"
};

function JsTc(oHandler, sParams, sParser) // TC = TagCloud
{
    var t = this;

    t.oObj = typeof oHandler == 'object' ? oHandler : document.getElementById("TAGS");
    t.sParams = sParams;
    // Arrays for data
    if (sParser)
    {
        t.sExp = new RegExp("[" + sParser + "]+", "i");
    } else
    {
        t.sExp = new RegExp(",");
    }
    t.oLast = {"str": false, "arr": false};
    t.oThis = {"str": false, "arr": false};
    t.oEl = {"start": false, "end": false};
    t.oUnfinedWords = {};
    // Flags
    t.bReady = true;
    t.eFocus = true;
    // Array with results & it`s showing
    t.aDiv = null;
    t.oDiv = null;
    // Pointers
    t.oActive = null;
    t.oPointer = [];
    t.oPointer_default = [];
    t.oPointer_this = 'input_field';

    t.oObj.onblur = function()
    {
        t.eFocus = false;
    };

    t.oObj.onfocus = function()
    {
        if (!t.eFocus)
        {
            t.eFocus = true;
            setTimeout(function(){
                t.CheckModif('focus')
            }, 500);
        }
    };

    t.oLast["arr"] = t.oObj.value.split(t.sExp);
    t.oLast["str"] = t.oLast["arr"].join(":");

    setTimeout(function(){
        t.CheckModif('this')
    }, 500);

    this.CheckModif = function(__data)
    {
        var
                sThis = false, tmp = 0,
                bUnfined = false, word = "",
                cursor = {};

        if (!t.eFocus)
            return;

        if (t.bReady && t.oObj.value.length > 0)
        {
            // Preparing input data
            t.oThis["arr"] = t.oObj.value.split(t.sExp);
            t.oThis["str"] = t.oThis["arr"].join(":");

            // Getting modificated element
            if (t.oThis["str"] && (t.oThis["str"] != t.oLast["str"]))
            {
                cursor['position'] = TCJsUtils.getCursorPosition(t.oObj);
                if (cursor['position']['end'] > 0 && !t.sExp.test(t.oObj.value.substr(cursor['position']['end'] - 1, 1)))
                {
                    cursor['arr'] = t.oObj.value.substr(0, cursor['position']['end']).split(t.sExp);
                    sThis = t.oThis["arr"][cursor['arr'].length - 1];

                    t.oEl['start'] = cursor['position']['end'] - cursor['arr'][cursor['arr'].length - 1].length;
                    t.oEl['end'] = t.oEl['start'] + sThis.length;
                    t.oEl['content'] = sThis;

                    t.oLast["arr"] = t.oThis["arr"];
                    t.oLast["str"] = t.oThis["str"];
                }
            }
            if (sThis)
            {
                // Checking for UnfinedWords
                for (tmp = 2; tmp <= sThis.length; tmp++)
                {
                    word = sThis.substr(0, tmp);
                    if (t.oUnfinedWords[word] == '!fined')
                    {
                        bUnfined = true;
                        break;
                    }
                }
                if (!bUnfined)
                    t.Send(sThis);
            }
        }
        setTimeout(function(){
            t.CheckModif('this')
        }, 500);
    };

    t.Send = function(sSearch)
    {
        if (!sSearch)
            return false;

        var oError = [];
        t.bReady = false;
        if (BX('wait_container'))
        {
            BX('wait_container').innerHTML = BX.message('JS_CORE_LOADING');
            BX.show(BX('wait_container'));
        }
        BX.ajax.post(
                '/bitrix/components/bitrix/search.tags.input/search.php',
                {"search": sSearch, "params": t.sParams},
                function(data)
                {
                    var result = {};
                    t.bReady = true;

                    try
                    {
                        eval("result = " + data + ";");
                    } catch (e)
                    {
                        oError['result_unval'] = e;
                    }

                    if (TCJsUtils.empty(result))
                        oError['result_empty'] = Errors['result_empty'];

                    try
                    {
                        if (TCJsUtils.empty(oError) && (typeof result == 'object'))
                        {
                            if (!(result.length == 1 && result[0]['NAME'] == t.oEl['content']))
                            {
                                t.Show(result);
                                return;
                            }
                        } else
                        {
                            t.oUnfinedWords[t.oEl['content']] = '!fined';
                        }
                    } catch (e)
                    {
                        oError['unknown_error'] = e;
                    }

                    if (BX('wait_container'))
                        BX.hide(BX('wait_container'));
                }
        );
    };

    t.Show = function(result)
    {
        t.Destroy();
        t.oDiv = document.body.appendChild(document.createElement("DIV"));
        t.oDiv.id = t.oObj.id + '_div';

        t.oDiv.className = "search-popup";
        t.oDiv.style.position = 'absolute';

        t.aDiv = t.Print(result);
        var pos = TCJsUtils.GetRealPos(t.oObj);
        t.oDiv.style.width = parseInt(pos["width"]) + "px";
        TCJsUtils.show(t.oDiv, pos["left"], pos["bottom"]);
        TCJsUtils.addEvent(document, "click", t.CheckMouse);
        TCJsUtils.addEvent(document, "keydown", t.CheckKeyword);
    };

    t.Print = function(aArr)
    {
        var aEl = null;
        var aResult = [];
        var aRes = [];
        var iCnt = 0;
        var oDiv = null;
        var oSpan = null;
        var sPrefix = t.oDiv.id;

        for (var tmp_ in aArr)
        {
            // Math
            if (aArr.hasOwnProperty(tmp_))
            {
                aEl = aArr[tmp_];
                aRes = [];
                aRes['ID'] = (aEl['ID'] && aEl['ID'].length > 0) ? aEl['ID'] : iCnt++;
                aRes['GID'] = sPrefix + '_' + aRes['ID'];
                aRes['NAME'] = TCJsUtils.htmlspecialcharsEx(aEl['NAME']);
                aRes['~NAME'] = aEl['NAME'];
                aRes['CNT'] = aEl['CNT'];
                aResult[aRes['GID']] = aRes;
                t.oPointer.push(aRes['GID']);
                // Graph
                oDiv = t.oDiv.appendChild(document.createElement("DIV"));
                oDiv.id = aRes['GID'];
                oDiv.name = sPrefix + '_div';

                oDiv.className = 'search-popup-row';

                oDiv.onmouseover = function(){
                    t.Init();
                    this.className = 'search-popup-row-active';
                };
                oDiv.onmouseout = function(){
                    t.Init();
                    this.className = 'search-popup-row';
                };
                oDiv.onclick = function(e){
                    t.oActive = this.id;
                    //$(".FindWord").addClass("showIt");
                    t.Replace();
                    t.Destroy();
                    BX.PreventDefault(e);
                };

                // oSpan = oDiv.appendChild(document.createElement("DIV"));
                // oSpan.id = oDiv.id + '_NAME';
                // oSpan.className = "search-popup-el search-popup-el-cnt";
                // oSpan.innerHTML = aRes['CNT'];

                oSpan = oDiv.appendChild(document.createElement("DIV"));
                oSpan.id = oDiv.id + '_NAME';
                oSpan.className = "search-popup-el search-popup-el-name";
                oSpan.innerHTML = aRes['NAME'];
            }
        }
        t.oPointer.push('input_field');
        t.oPointer_default = t.oPointer;
        return aResult;
    };

    t.Destroy = function()
    {
        try
        {
            TCJsUtils.hide(t.oDiv);
            t.oDiv.parentNode.removeChild(t.oDiv);
        } catch (e)
        {
        }
        t.aDiv = [];
        t.oPointer = [];
        t.oPointer_default = [];
        t.oPointer_this = 'input_field';
        t.bReady = true;
        t.eFocus = true;
        t.oActive = null;

        TCJsUtils.removeEvent(document, "click", t.CheckMouse);
        TCJsUtils.removeEvent(document, "keydown", t.CheckKeyword);
    };

    t.Replace = function()
    {
        if (typeof t.oActive == 'string')
        {
            var tmp = t.aDiv[t.oActive];
            var tmp1 = '';
            if (typeof tmp == 'object')
            {
                var elEntities = document.createElement("textarea");
                elEntities.innerHTML = tmp['~NAME'];
                tmp1 = elEntities.value;
            }
            //this preserves leading spaces
            var start = t.oEl['start'];
            while (start < t.oObj.value.length && t.oObj.value.substring(start, start + 1) == " ")
                start++;

            t.oObj.value = t.oObj.value.substring(0, start) + tmp1 + t.oObj.value.substr(t.oEl['end']);
            TCJsUtils.setCursorPosition(t.oObj, start + tmp1.length);
        }
    };

    t.Init = function()
    {
        t.oActive = false;
        t.oPointer = t.oPointer_default;
        t.Clear();
        t.oPointer_this = 'input_pointer';
    };

    t.Clear = function()
    {
        var oEl = t.oDiv.getElementsByTagName("div");
        if (oEl.length > 0 && typeof oEl == 'object')
        {
            for (var ii in oEl)
            {
                if (oEl.hasOwnProperty(ii))
                {
                    var oE = oEl[ii];
                    if (oE && (typeof oE == 'object') && (oE.name == t.oDiv.id + '_div'))
                    {
                        oE.className = "search-popup-row";
                    }
                }
            }
        }
    };

    t.CheckMouse = function()
    {
        t.Replace();
        t.Destroy();
    };

    t.CheckKeyword = function(e)
    {
        if (!e)
            e = window.event;
        var oP = null;
        var oEl = null;
        if ((37 < e.keyCode && e.keyCode < 41) || (e.keyCode == 13))
        {
            t.Clear();

            switch (e.keyCode)
            {
                case 38:
                    oP = t.oPointer.pop();
                    if (t.oPointer_this == oP)
                    {
                        t.oPointer.unshift(oP);
                        oP = t.oPointer.pop();
                    }

                    if (oP != 'input_field')
                    {
                        t.oActive = oP;
                        oEl = document.getElementById(oP);
                        if (typeof oEl == 'object')
                        {
                            oEl.className = "search-popup-row-active";
                        }
                    }
                    t.oPointer.unshift(oP);
                    break;
                case 40:
                    oP = t.oPointer.shift();
                    if (t.oPointer_this == oP)
                    {
                        t.oPointer.push(oP);
                        oP = t.oPointer.shift();
                    }
                    if (oP != 'input_field')
                    {
                        t.oActive = oP;
                        oEl = document.getElementById(oP);
                        if (typeof oEl == 'object')
                        {
                            oEl.className = "search-popup-row-active";
                        }
                    }
                    t.oPointer.push(oP);
                    break;
                case 39:
                    t.Replace();
                    t.Destroy();
                    break;
                case 13:
                    t.Replace();
                    t.Destroy();
                    if (TCJsUtils.IsIE())
                    {
                        e.returnValue = false;
                        e.cancelBubble = true;
                    } else
                    {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    break;
            }
            t.oPointer_this = oP;
        } else
        {
            t.Destroy();
        }
    }
}

var TCJsUtils =
        {
            arEvents: [],

            addEvent: function(el, evname, func)
            {
                if (el.attachEvent) // IE
                    el.attachEvent("on" + evname, func);
                else if (el.addEventListener) // Gecko / W3C
                    el.addEventListener(evname, func, false);
                else
                    el["on" + evname] = func;
                this.arEvents[this.arEvents.length] = {'element': el, 'event': evname, 'fn': func};
            },

            removeEvent: function(el, evname, func)
            {
                if (el.detachEvent) // IE
                    el.detachEvent("on" + evname, func);
                else if (el.removeEventListener) // Gecko / W3C
                    el.removeEventListener(evname, func, false);
                else
                    el["on" + evname] = null;
            },

            getCursorPosition: function(oObj)
            {
                var result = {'start': 0, 'end': 0};
                if (!oObj || (typeof oObj != 'object'))
                    return result;
                try
                {
                    if (document.selection != null && oObj.selectionStart == null)
                    {
                        oObj.focus();
                        var oRange = document.selection.createRange();
                        var oParent = oRange.parentElement();
                        var sBookmark = oRange.getBookmark();
                        var sContents_ = oObj.value;
                        var sContents = sContents_;
                        var sMarker = '__' + Math.random() + '__';

                        while (sContents.indexOf(sMarker) != -1)
                        {
                            sMarker = '__' + Math.random() + '__';
                        }

                        if (!oParent || oParent == null || (oParent.type != "textarea" && oParent.type != "text"))
                        {
                            return result;
                        }

                        oRange.text = sMarker + oRange.text + sMarker;
                        sContents = oObj.value;
                        result['start'] = sContents.indexOf(sMarker);
                        sContents = sContents.replace(sMarker, "");
                        result['end'] = sContents.indexOf(sMarker);
                        oObj.value = sContents_;
                        oRange.moveToBookmark(sBookmark);
                        oRange.select();
                        return result;
                    } else
                    {
                        return {
                            'start': oObj.selectionStart,
                            'end': oObj.selectionEnd
                        };
                    }
                } catch (e) {
                }
                return result;
            },

            setCursorPosition: function(oObj, iPosition)
            {
                if (typeof oObj != 'object')
                    return false;

                oObj.focus();

                try
                {
                    if (document.selection != null && oObj.selectionStart == null)
                    {
                        var oRange = document.selection.createRange();
                        oRange.select();
                    } else
                    {
                        oObj.selectionStart = iPosition;
                        oObj.selectionEnd = iPosition;
                    }
                    return true;
                } catch (e)
                {
                    return false;
                }
            },

            printArray: function(oObj, sParser, iLevel)
            {
                try
                {
                    var result = '';
                    var space = '';

                    if (iLevel == undefined)
                        iLevel = 0;
                    if (!sParser)
                        sParser = "\n";

                    for (var j = 0; j <= iLevel; j++)
                        space += '  ';

                    for (var i in oObj)
                    {
                        if (oObj.hasOwnProperty(i))
                        {
                            if (typeof oObj[i] == 'object')
                                result += space + i + " = {" + sParser + TCJsUtils.printArray(oObj[i], sParser, iLevel + 1) + ", " + sParser + "}" + sParser;
                            else
                                result += space + i + " = " + oObj[i] + "; " + sParser;
                        }
                    }
                    return result;
                } catch (e)
                {
                }
            },

            empty: function(oObj)
            {
                if (oObj)
                {
                    for (var i in oObj)
                    {
                        if (oObj.hasOwnProperty(i))
                        {
                            return false;
                        }
                    }
                }
                return true;
            },

            show: function(oDiv, iLeft, iTop)
            {
                if (typeof oDiv != 'object')
                    return;
                var zIndex = parseInt(oDiv.style.zIndex);
                if (zIndex <= 0 || isNaN(zIndex))
                    zIndex = 2200;
                oDiv.style.zIndex = zIndex;
                oDiv.style.left = iLeft + "px";
                oDiv.style.top = iTop + "px";
                return oDiv;
            },

            hide: function(oDiv)
            {
                if (oDiv)
                    oDiv.style.display = 'none';
            },

            GetRealPos: function(el)
            {
                if (!el || !el.offsetParent)
                    return false;

                var res = {};
                var objParent = el.offsetParent;
                res["left"] = el.offsetLeft;
                res["top"] = el.offsetTop;
                while (objParent && objParent.tagName != "BODY")
                {
                    res["left"] += objParent.offsetLeft;
                    res["top"] += objParent.offsetTop;
                    objParent = objParent.offsetParent;
                }
                res["right"] = res["left"] + el.offsetWidth;
                res["bottom"] = res["top"] + el.offsetHeight;
                res["width"] = el.offsetWidth;
                res["height"] = el.offsetHeight;

                return res;
            },

            IsIE: function()
            {
                return (document.attachEvent && !TCJsUtils.IsOpera());
            },

            IsOpera: function()
            {
                return (navigator.userAgent.toLowerCase().indexOf('opera') != -1);
            },

            htmlspecialcharsEx: function(str)
            {
                return str.replace(/&amp;/g, '&amp;amp;').replace(/&lt;/g, '&amp;lt;').replace(/&gt;/g, '&amp;gt;').replace(/&quot;/g, '&amp;quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            },

            htmlspecialcharsback: function(str)
            {
                return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;;/g, '"').replace(/&amp;/g, '&');
            }
        };

$(document).ready(function(e){
    /*$(".SearchTag .SearchIt").keyup(function(){
     var thisKey = $(this).val();
     if (!thisKey) {
     $(".FindWord").removeClass("showIt");
     }
     });*/

    /*$(".UnderstandIt").on('click', function(){
     $(".SearchText").removeClass("ShowItNice");
     $(".SearchText").addClass("HideItNice");
     });*/
    $(".SearchIt").on('click', function(){
        $(".search__placeholder").hide();

    });
    $(document).click(function(event){
        if ($(event.target).closest(".SearchTag").length)
            return;
        var inputVal = $(".SearchIt").val();
        if (inputVal <= 0) {
            $(".search__placeholder").show();
        } else {
            $(".search__placeholder").hide();
        }
        event.stopPropagation();
    });
    /*$(".FindWord").on("click", function(){
     var findit = $('.SearchIt').val();
     if (findit) {
     $.ajax({
     type: "POST",
     cache: false,
     url: "/ajax_word.php",
     data: "name=" + findit,
     success: function(data){
     $(".FindWord").removeClass("showIt");
     $(".Explanation").html(data).addClass("showit");
     }
     });
     } else {
     $(".Explanation").html("Вы забыли ввести интересующее вас слово!").addClass("showit");
     }
     });*/
    $(".SearchSubmitDiv").click(function(e){
        $(".SearchIt").prop('disabled', true);
        $.ajax({
            type: "POST",
            cache: false,
            url: "/ajax_search.php",
            data: "tags=" + $('.SearchIt').val(),
            success: function(data){
                var result = data;
                var myArray = data.split(',');
                var count = myArray.length;
                var servOk = $("#Serv_" + myArray[0]).length;
                if (servOk > 0) {
                    var okS = $(".SearchIt").val();
                    var myArray = data.split(',');
                    var count = myArray.length;
                    $(".service__item").trigger("click");
                    for (var i = 0; i < myArray.length; i++) {
                        $('#Serv_' + myArray[i]).trigger("click");
                    }
                    $('html, body').animate({scrollTop: $('#services').offset().top - 70}, 500);
                    $(".SearchIt").val("");
                    $('.search__placeholder').show().html("Искали: <span>" + okS + "</span>");
                    $(".SearchIt").focusout();
                    $(".SearchIt").prop('disabled', false);
                } else {
                    var okS = $(".SearchIt").val();
                    $(".SearchIt").val("");
                    $('.search__placeholder').show().html("Ничего не найдено!");
                    $(".SearchIt").focusout();
                    $(".SearchIt").prop('disabled', false);
                }
            }
        });
        return false
    });
});


$(document).ready(function(e){
    var preSelectedItem = $(".service__item.selected");
    var preSelectedId = preSelectedItem.attr("id");
    var founded = preSelectedItem.html();
    var iDs = preSelectedItem.attr("data-services");
    var foundOK = "<div class='found__selected " + preSelectedId + "' data-iDs=" + iDs + ">" + founded + "<span class='" + preSelectedId + "'></span></div>";
    $(".Founded").append(foundOK);
    selectedService(preSelectedItem);
    $(".mobile-checkbox input").prop('checked', false);
    $(".mobile-checkbox[data-id='" + preSelectedId + "'] input").prop('checked', true);

    function selectedService(element){
        var stypes = element.attr('data-services');
        console.log(stypes);
        var myArray = stypes.split('|');
        for (var i = 0; i < myArray.length; i++) {
            $(myArray[i]).attr("data-servicOk", "Y");
            var Count = $(myArray[i]).attr("data-Count");
            var CurCount = parseInt(Count) + parseInt(1);
            $(myArray[i]).attr("data-count", CurCount);
            $(myArray[i]).addClass("selected");
        }
    }

    function unSelectedService(element){
        var stypes = element.attr('data-services');
        var myArray = stypes.split('|');
        for (var i = 0; i < myArray.length; i++) {
            var Count = $(myArray[i]).attr("data-Count");
            var CurCount = parseInt(Count) - parseInt(1);
            $(myArray[i]).attr("data-count", CurCount);
            if (CurCount < 1) {
                $(myArray[i]).attr("data-servicOk", "N");
                $(myArray[i]).removeClass("selected");
            }
        }
    }

    $(".service__item").click(function(){
        var thisId = $(this).attr("id");

        var ok = $(".Founded").find("." + thisId).length;
        $(this).removeClass("selected");

        if (ok > 0) {
            $("#" + thisId).removeClass("selected");
            $(".Founded").find("." + thisId).remove();
            $(".mobile-checkbox[data-id='" + thisId + "'] input").prop('checked', false);
            unSelectedService($(this));
        } else {
            $(this).addClass("selected");
            var founded = $(this).html();
            var iDs = $(this).attr("data-services");
            var foundOK = "<div class='found__selected " + thisId + "' data-iDs=" + iDs + ">" + founded + "<span class='" + thisId + "'></span></div>";
            $(".Founded").append(foundOK);
            $(".mobile-checkbox[data-id='" + thisId + "'] input").prop('checked', true);

            selectedService($(this));
        }
        return false;
    });
    
    // добавить после подгрузки расписания
    //var sheduleIds = $(".found__selected").data("ids");
    //var myArray = sheduleIds.split('|');
    //for (var i = 0; i < myArray.length; i++) {
    //    $(myArray[i]).addClass("selected");
    //}

    $(".mobile-checkbox input").click(function(){
        var thisId = $(this).parents(".mobile-checkbox").data("id");
        $(".service__item[id='" + thisId + "']").trigger("click");
    });

    $(".mobile-office input").click(function(){
        var thisId = $(this).parents(".mobile-office").data("shedule");
        $(".shedule__office-item[data-shedule='" + thisId + "']").trigger("click");
    });

    $(".shedule-mobile__found ").on("click", ".found__selected span", function(){
        var cancelId = $(this).attr("class");
        $(".service__item[id='" + cancelId + "']").trigger("click");
    });


    var dataTabOnLoad = $(".shedule__office-item.active").data("shedule");
    var foundedOnLoad = $(".shedule__office-item.active").html();
    $(".shedule__day-wrap").hide();
    $(".shedule__day-wrap[data-shedule='" + dataTabOnLoad + "']").show();
    $(".mobile-office input").prop('checked', false);
    $(".mobile-office[data-shedule='" + dataTabOnLoad + "'] input").prop('checked', true);
    var foundOK = "<div class='found__selected' data-shedule='" + dataTabOnLoad + "'>" + foundedOnLoad + "</div>";
    $(".Founded").prepend(foundOK);

    $(".shedule__office-item").on("click", function(){
        var dataTab = $(this).data("shedule");
        var founded = $(this).html();
        $(".shedule__office-item").removeClass("active");
        $(this).addClass("active");
        $(".shedule__phone-num").removeClass("active");
        $(".shedule__phone-num[data-shedule='" + dataTab + "']").addClass("active");
        $(".shedule__day-wrap").hide();
        $(".shedule__day-wrap[data-shedule='" + dataTab + "']").show();
        $(".Founded").find(".found__selected[data-shedule]").remove();
        var foundOK = "<div class='found__selected' data-shedule='" + dataTab + "'>" + founded + "</div>";
        $(".Founded").prepend(foundOK);
    });
    
    $(".mobile-filter__clear").on("click", function(){
        $(".mobile-office[data-shedule='vni'] input").trigger("click");
        $(".mobile-checkbox input").each(function(){
            if ($(this).prop("checked")) {
                var thisId = $(this).parents(".mobile-checkbox").data("id");
                $(".service__item[id='" + thisId + "']").trigger("click");
            }
        });
    });
    
    

    $(".datepicker__width").text($('#datepicker').val());
    $("#datepicker").width($(".datepicker__width").width());

    $("#datepicker").datepicker({
        defaultDate: 0,
        minDate: 0,
        maxDate: "+1M +10D",
        dateFormat: 'd MM',
        showOptions: {direction: "down"},
        onSelect: function(_date){
            var selectDate = $(this).datepicker("getDate"); // Retrieve selected date
            var startDate = $.datepicker.formatDate("d MM", selectDate);
            selectDate.setDate(selectDate.getDate() + 6); // Add 7 days
            var endDate = $.datepicker.formatDate("d MM", selectDate); // Reformat
            $("#datepicker").val(startDate + " - " + endDate);
            $(".datepicker__width").text($("#datepicker").val());
            $("#datepicker").width($(".datepicker__width").width());
        }
    });

    var todayDate = new Date();
    var startDate = $.datepicker.formatDate("d MM", todayDate);
    todayDate.setDate(todayDate.getDate() + 6);
    var endDate = $.datepicker.formatDate("d MM", todayDate);
    $("#datepicker").datepicker("setDate", startDate);
    $("#datepicker").val(startDate + " - " + endDate);
    $(".datepicker__width").text($('#datepicker').val());
    $("#datepicker").width($(".datepicker__width").width());
});
// Copyright 2021 Google LLC
//
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file or at
// https://developers.google.com/open-source/licenses/bsd

var oReportData = {};

$("#popupClose").click(function () {
	$("#popup_bg,#popup").hide();
	$("#report").empty();
});

$('#printData').click(function () {
	
	//var options = 'top=10, left=10, width=500, height=600, status=no, menubar=no, toolbar=no, resizable=no';    
	//var popup = window.open('print.html', 'popup', options );
	var value = JSON.stringify( oReportData );	
		
	var html = "";
	var idx = 1;
	for ( phone in oReportData ){	
		//console.log( phone );		
		var oNaverRes = oReportData[phone]["naver"];
		var oDaumRes = oReportData[phone]["daum"];					
		console.log( idx, oNaverRes, oDaumRes );					
		
		// PREFIX
		html += `<tr>
					<td>${idx}</td>
					<td>${phone}</td>
				`;
		
		// 네이버 결과
		if ( Array.isArray( oNaverRes ) && oNaverRes.length > 0 ){					
			var name = "";
			var category = "";
			var addr = "";
			
			if ( oNaverRes.length == 1 ){
				name 	 += `${oNaverRes[0]["name"]}` ;
				category += `${oNaverRes[0]["category"]}` ;
				addr 	 += `${oNaverRes[0]["addr_doro"]}` ;
			}
			else{
				for( var i = 0 ; i < oNaverRes.length ; i++ ){				
					name 	 += `[${i+1}] ${oNaverRes[i]["name"]} <br>` ;
					category += `[${i+1}] ${oNaverRes[i]["category"]} <br>` ;
					addr 	 += `[${i+1}] ${oNaverRes[i]["addr_doro"]} <br>` ;
				}
			}
			
			html += `										
					<td>${name}</td>
					<td>${category}</td>
					<td>${addr}</td>
				`;					
		}
		else{
			html += `					
					<td>-</td>
					<td>-</td>
					<td>-</td>					
				`;
		}
		
		// 다음 결과
		if ( Array.isArray( oDaumRes ) && oDaumRes.length > 0 ){
			
			var name = "";
			var category = "";
			var addr = "";
			
			if ( oDaumRes.length == 1 ){
				name 	 += `${oDaumRes[0]["name"]}` ;
				category += `${oDaumRes[0]["category"]}` ;
				addr 	 += `${oDaumRes[0]["addr_doro"]}` ;
			}
			else{
				for( var i = 0 ; i < oDaumRes.length ; i++ ){				
					name 	 += `[${i+1}] ${oDaumRes[i]["name"]} <br>` ;
					category += `[${i+1}] ${oDaumRes[i]["category"]} <br>` ;
					addr 	 += `[${i+1}] ${oDaumRes[i]["addr_doro"]} <br>` ;
				}
			}
			
			html += `										
					<td>${name}</td>
					<td>${category}</td>
					<td>${addr}</td>
				`;
		}
		else{
			html += `					
					<td>-</td>
					<td>-</td>
					<td>-</td>					
				`;
		}
			
		// SUEFIX	
		html += `</tr>`										
		
		idx++;
	 }
	 
	 $("#report").html( html );
	 $("#popup_bg,#popup").show();
});

// 저장
$('#saveData').click(function () {
	var todayDate = getToday();
	localStorage.setItem( todayDate, JSON.stringify( oReportData ));	
	alert("검색 결과가 저장 되었습니다.");
});

// 데이터로드
$('#loadData').click(function () {
	var todayDate = getToday();
	var value = localStorage.getItem(todayDate);		
	oReportData = JSON.parse( value );		
	//console.log( "load = ", oReportData );

	var phoneList = [];
	for ( phone in oReportData ){
		phoneList.push( phone );  
	}		
	makePhoneList( phoneList, false );
	
	
	
	for ( phone in oReportData ){			
		if ( oReportData[phone] ){
			var oNaverRes = oReportData[phone]["naver"];
			var oDaumRes = oReportData[phone]["daum"];
			//console.log(  oNaverRes, oDaumRes );
			
			var color = '#FF4400'; // red
			if ( !oNaverRes && !oDaumRes ){
				color = 'white';
			}
			else if ( oNaverRes.length > 0 && oDaumRes.length > 0 ){
				color = '#19CE60'; // green
			}			
			else if ( oNaverRes.length > 0 || oDaumRes.length > 0 ){
				color = '#93ff93'; // 연두#00FF80
			}
			$("#"+phone).css("background-color", color );
		} 		
		phoneList.push( phone );  
	}
	
	if ( phoneList.length > 0 ){
		alert( phoneList.length + "건 데이터를 로드하였습니다");
	} else{
		alert("로드할 데이터가 없습니다.");
	}
});

function searchAutoList( idx ){
	var phoneNum = $("#phoneList tr:eq(" + idx + ") td").attr("id");
	searchMulti( phoneNum );
}

// 통합 검색
$('#single_search').click(function () {		
		// plain/text 형태로 가져옴. 돔으로 검색할수 있는 형태 필요함.
		var phoneNum = $("#search").val(); //'0616821577';
		if ( phoneNum == 'james'){
			alert("자동 요청 기능 시작되었습니다.");	
			var index = 0;
			var randInterval = Math.floor( Math.random() * 100 ) % 3 + 2; // 2~5초 사이 랜덤
			var maxIndex = $("#phoneList tr").length;
			var interval = setInterval(function() {
				searchAutoList( index );
				index++;		
				
				// 1000회 동작
				if ( index > maxIndex ){
					clearInterval(interval);
					alert("자동 요청 기능 종료되었습니다!");	
					$('#saveData').trigger("click");
				}							
			}, randInterval * 1000 );
		}
		else{
			searchMulti( phoneNum );
		}
});

// 전화번호 리스트 생성
$("#parsing").click(function () {				
		var value = $("#textarea_input").val(); 
		var phoneList = value.split("\n");
		//console.log( "value = ", phoneList );
		makePhoneList( phoneList, true );
});

// 전화번호 더블클릭 
$( document).on("dblclick", "table tr td", function ( event ) {	
	var phoneNum = $(this).text().trim();	
	$("#search").val( phoneNum );
	$('#single_search').trigger("click");	
});

function getToday(){
	var now = new Date();
	var year = 1900 + now.getYear();
	var month = now.getMonth() + 1;
	var date = now.getDate();
	var todayDate = year + "" + ( month < 10 ? "0" + month : month ) + "" + ( date < 10 ? "0" + date : date );
	return todayDate;	
}

function makePhoneList( phoneList, isInit ){
	var html = "";
	for( var i = 0 ; i < phoneList.length; i++ ){
		var phone = phoneList[i].trim();
		if ( phone ){
			
			html += `<tr>
						<td id='${phone}' data-naver_view='-1' data-daum_view='-1'>${phone}</td>
					</tr>`;
			if ( isInit ){
				oReportData[phone] = { "naver" : null, "daum" : null };
			}			
		}
	}	
	
	//console.log( "html = ", html );		
	if ( html != "" ){
		$("#phoneList").append( html ).css("font-size", "13px");
	}			
}

function searchMulti( phoneNum ){
	
	var naverUrl = 'https://search.naver.com/search.naver?query=' + phoneNum;
	var daumUrl = 'https://search.daum.net/search?w=tot&q=' + phoneNum;		
	/*
	fetch( url ).then(r => r.text()).then(result => {
		// Result now contains the response text, do what you want...
		console.log("res = ", result );
	})
	*/
				
	request_url( naverUrl, phoneNum, "naver_view", "place-app-root", ["div.place_section_content div:eq(0)"] );
	request_url( daumUrl, phoneNum, "daum_view", "poiColl", [] );	
}

function parse_res_daum( phone_num ){
	var resultList = $("#daum_view ul.list_place li");
	var oDataList = [];
	for ( var i = 0 ; i < resultList.length ; i++ ){
		var elRow = $( resultList[i] );
		var name = elRow.find( "a.fn_tit").text(); 
		var category = elRow.find( "span.tit_sub").text(); 
		var tel = elRow.find( "span.f_url").text();		
		var addr1 = elRow.find("dt.cont").text();
		var addr2 = elRow.find("dd.cont").text();
		
		oDataList.push( { "name" : name, "category" : category, "tel" : tel, "addr_doro" : addr1, "addr_jibun" : addr2 });
		console.log( oDataList );
	}
	return oDataList;
}

function parse_res_naver( phone_num ){
	
	var oDataList = [];
	
	// 검색결과 N건(여러건) 있을 경우 
	var resultList = $("#naver_view div.place_section_content > ul > li");
	if ( resultList.length > 0 ){
		for ( var i = 0 ; i < resultList.length ; i++ ){
			var elRow = $( resultList[i] );		
			var name = elRow.find("a > div:eq(0) > div:eq(0) span:eq(0)").text(); 
			var category = elRow.find("a > div:eq(0) > div:eq(0) span:eq(1)").text(); 		
			var tel = elRow.find("> div:eq(0) > div:eq(0)").text(); 		
			var addr = elRow.find("> div:eq(0) > div:eq(1) a > span").text(); 	
			//console.log("[naver] = ", name, category, tel, addr );			
			oDataList.push( { "name" : name, "category" : category, "tel" : tel, "addr_doro" : addr, "addr_jibun" : addr  });
		}			
		
		console.log( oDataList );
		return oDataList;	
	}	
		
	// 검색결과 1건
	var resultList = $("#naver_view div.place_section_content > div");		
	for ( var i = 0 ; i < resultList.length ; i++ ){
		var elRow = $( resultList[i] );		
		var name = elRow.find("> div:eq(0) > div:eq(0) a").text(); 
		var category = elRow.find("> div:eq(0) > div:eq(0) span").text(); 		
		if ( category.indexOf( '네이버페이' ) >= 0 || category.indexOf( '네이버예약' ) >= 0){
			category = "";
		}
		
		var tel = elRow.find("> div:eq(1) > div:eq(0) div").text(); 	
		var addr = elRow.find("> div:eq(1) > div:eq(1) div").text(); 	
		var addr1 = addr.split("지번")[0];
		var addr2 = addr.split("지번")[1];
				
		oDataList.push( { "name" : name, "category" : category, "tel" : tel, "addr_doro" : addr1, "addr_jibun" : addr2  });
		console.log( oDataList );
	}
	return oDataList;
}

function request_url( url, phone_num, element_id, extract_id, remove_selector_list ){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	var elResultRow = $("#" + phone_num );
	var service = element_id.split("_")[0];
	/*
	if ( !oReportData[ phone_num ] ){
		oReportData[ phone_num ] = { "naver" : null, "daum" : null };
	}
	*/
	
	xhr.onreadystatechange = function callback() {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				result = normalize_html( xhr.responseText );
				//console.log( element_id, " => ", result );
				$("#" + element_id ).html( result );			
				
				var extractElement = $("#" + extract_id );
				if ( extractElement.length > 0 ){
					$("#" + element_id ).html( extractElement.html() );
				
					for ( var i = 0 ; i < remove_selector_list.length ; i++ ){
						$( remove_selector_list[i] ).remove();						
					}
					$("a,div,span").css("font-size", "13px");						
					elResultRow.attr( "data-"+ element_id , "true");					
					
					var oData = null;
					if ( element_id == 'naver_view'){
						oData = parse_res_naver( phone_num );				
					}
					else if ( element_id == 'daum_view'){
						oData = parse_res_daum( phone_num );						
					}
										
					// 파싱결과 저장
					oReportData[ phone_num ][service] = oData;					
					
				}else{
					$("#" + element_id ).html( "검색결과가 없습니다." );					
					elResultRow.attr( "data-"+ element_id , "false");									
					// 파싱결과 저장											
					oReportData[ phone_num ][service] = {};	
				}	
				
				
				// 결과가 모두 완료되었는지 확인 (Ui렌더링 비동기 처리를 위해 setTimeout 사용))
				setTimeout( function() {					
					var naverResult = elResultRow.data().naver_view;
					var daumResult = elResultRow.data().daum_view;
					
					if ( naverResult != -1 && daumResult != -1 ){
						var color = "#FF4400"; // red
						if ( naverResult == true && daumResult == true ){
							color = '#19CE60'; //green
						}
						else if ( naverResult == true || daumResult == true ){
							color = '#93ff93'; // 연두
						}						
						elResultRow.css("background-color", color );
					}				
					//console.log( element_id, $("#" + phone_num ).data(), "naver= ", naverResult, ", daum = ",  daumResult );
				}, 500);

			}
		}
	};
	xhr.send();
}

function normalize_html ( html ){
	
	var new_html = html;
	// script 태그 제거 
	for( var i = 0 ; i < 100; i++ ){	
		var prevLen = new_html.length;
		new_html = removeElement( new_html, 'script' );
		if ( new_html.length == prevLen ){		
			break;
		}
	}
	//console.log( new_html );
	return new_html;
}

function removeElement( html, tagName ){
	
	var endTag = "</" + tagName + ">";
	var startIdx = html.indexOf( "<" + tagName );
	var endIdx = html.indexOf( endTag );
	
	if ( startIdx >= 0 && endIdx >= 0 ){		
		return html.substring( 0, startIdx ) + html.substring( endIdx + endTag.length, html.length );
	}
	//console.log("not found = ", startIdx, endIdx );
	return html;	
}

/*
// Search the bookmarks when entering the search keyword.
$('#search').change(function () {
  $('#bookmarks').empty();
  dumpBookmarks($('#search').val());
});

// Traverse the bookmark tree, and print the folder and nodes.
function dumpBookmarks(query) {
  var bookmarkTreeNodes = chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
    $('#bookmarks').append(dumpTreeNodes(bookmarkTreeNodes, query));
  });
}

function dumpTreeNodes(bookmarkNodes, query) {
  var list = $('<ul>');
  for (var i = 0; i < bookmarkNodes.length; i++) {
    list.append(dumpNode(bookmarkNodes[i], query));
  }

  return list;
}

function dumpNode(bookmarkNode, query) {
  if (bookmarkNode.title) {
    if (query && !bookmarkNode.children) {
      if (String(bookmarkNode.title.toLowerCase()).indexOf(query.toLowerCase()) == -1) {
        return $('<span></span>');
      }
    }

    var anchor = $('<a>');
    anchor.attr('href', bookmarkNode.url);
    anchor.text(bookmarkNode.title);
    
     // When clicking on a bookmark in the extension, a new tab is fired with
     // the bookmark url.
    
    anchor.click(function () {
      chrome.tabs.create({ url: bookmarkNode.url });
    });

    var span = $('<span>');
    var options = bookmarkNode.children ?
      $('<span>[<a href="#" id="addlink">Add</a>]</span>') :
      $('<span>[<a id="editlink" href="#">Edit</a> <a id="deletelink" ' +
        'href="#">Delete</a>]</span>');
    var edit = bookmarkNode.children ? $('<table><tr><td>Name</td><td>' +
      '<input id="title"></td></tr><tr><td>URL</td><td><input id="url">' +
      '</td></tr></table>') : $('<input>');

      // Show add and edit links when hover over.
    span.hover(function () {
      span.append(options);
      $('#deletelink').click(function (event) {
        console.log(event)
        $('#deletedialog').empty().dialog({
          autoOpen: false,
          closeOnEscape: true,
          title: 'Confirm Deletion',
          modal: true,
          show: 'slide',
          position: {
            my: "left",
            at: "center",
            of: event.target.parentElement.parentElement
          },
          buttons: {
            'Yes, Delete It!': function () {
              chrome.bookmarks.remove(String(bookmarkNode.id));
              span.parent().remove();
              $(this).dialog('destroy');
            },
            Cancel: function () {
              $(this).dialog('destroy');
            }
          }
        }).dialog('open');
      });
      $('#addlink').click(function (event) {
        edit.show();
        $('#adddialog').empty().append(edit).dialog({
          autoOpen: false,
          closeOnEscape: true,
          title: 'Add New Bookmark',
          modal: true,
          show: 'slide',
          position: {
            my: "left",
            at: "center",
            of: event.target.parentElement.parentElement
          },
          buttons: {
            'Add': function () {
              edit.hide();
              chrome.bookmarks.create({
                parentId: bookmarkNode.id,
                title: $('#title').val(), url: $('#url').val()
              });
              $('#bookmarks').empty();
              $(this).dialog('destroy');
              window.dumpBookmarks();
            },
            'Cancel': function () {
              edit.hide();
              $(this).dialog('destroy');
            }
          }
        }).dialog('open');
      });
      $('#editlink').click(function (event) {
        edit.show();
        edit.val(anchor.text());
        $('#editdialog').empty().append(edit).dialog({
          autoOpen: false,
          closeOnEscape: true,
          title: 'Edit Title',
          modal: true,
          show: 'fade',
          position: {
            my: "left",
            at: "center",
            of: event.target.parentElement.parentElement
          },
          buttons: {
            'Save': function () {
              edit.hide();
              chrome.bookmarks.update(String(bookmarkNode.id), {
                title: edit.val()
              });
              anchor.text(edit.val());
              options.show();
              $(this).dialog('destroy');
            },
            'Cancel': function () {
              edit.hide();
              $(this).dialog('destroy');
            }
          }
        }).dialog('open');
      });
      options.fadeIn();
    },

      // unhover
      function () {
        options.remove();
      }).append(anchor);
  }

  var li = $(bookmarkNode.title ? '<li>' : '<div>').append(span);
  if (bookmarkNode.children && bookmarkNode.children.length > 0) {
    li.append(dumpTreeNodes(bookmarkNode.children, query));
  }

  return li;
}

document.addEventListener('DOMContentLoaded', function () {
  dumpBookmarks();
});
*/

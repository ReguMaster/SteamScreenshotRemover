// ==UserScript==
// @name         Steam Community - Screenshot Remover
// @namespace    ReguMaster
// @version      1.0
// @description  More options to delete screenshots.
// @author       ReguMaster
// @match        *://steamcommunity.com/*
// @grant        none
// ==/UserScript==

var interval = 1000;

jQuery.fn.center = function( )
{
    this.css( "position", "absolute" );

    this.css( "top", Math.max( 0, ( ( jQuery( window )
            .height( ) - jQuery( this )
            .outerHeight( ) ) / 2 ) +
        jQuery( window )
        .scrollTop( ) ) + "px" );

    this.css( "left", Math.max( 0, ( ( jQuery( window )
            .width( ) - jQuery( this )
            .outerWidth( ) ) / 2 ) +
        jQuery( window )
        .scrollLeft( ) ) + "px" );
        
    return this;
}

function onSuccessScrollBottom( )
{
    setModal( "서버에 요청하는 중 ..." );
    deleteRequest( );
}

function setModal( message )
{
    var modal = jQuery( "#loadingPageModal" );

    modal.show( );
    modal.find( ".imgWallLoadingPageModal" )
        .css( "height", "auto" )
        .html( `<div><img src="https://steamcommunity-a.akamaihd.net/public/images/login/throbber.gif"></img>${ message }</div><div>모든 작업이 자동으로 이루어집니다, 작업이 끝날때까지 건드리지 마세요.</div>` );
}

function deleteRequest( )
{
    var sessionID = jQuery( "input[name=sessionid]" )
        .get( 0 )
        .value;
    var screenShots = {};

    var datapre = {
        action: "private",
        sessionid: sessionID
    };

    jQuery( ".imgWallHover" )
        .each( function( index, val )
        {
            val = jQuery( val );
            var idFixed = val.attr( "id" )
                .replace( "imgWallHover", "" );

            console.log( idFixed );

            screenShots[ "screenshots[" + Number( idFixed ) + "]" ] = "on";
        } );

    datapre = Object.assign( datapre, screenShots );

    var countRefreshInterval = setInterval( function( )
    {
        getScreenShotCount( function( count )
        {
            setModal( "스크린샷을 삭제하고 있습니다! (" + count + "개 남음)" );
        } );
    }, 1000 );

    jQuery.ajax(
    {
        url: window.location.href,
        data: datapre,
        method: "post",
        complete: function( result )
        {
            clearInterval( countRefreshInterval );
            setModal( "모든 스크린샷의 삭제가 완료되었습니다." );
            alert( "모든 스크린샷의 삭제가 완료되었습니다." );

            window.location.href = window.location.href;
        }
    } );
}

function getScreenShotCount( callback )
{
    jQuery.ajax(
    {
        url: window.location.href.replace( "/screenshots", "" ),
        method: "get",
        dataType: "html",
        complete: function( result )
        {
            try
            {
                var communityHtml = jQuery( result.responseText );
                var count = communityHtml.find( ".profile_item_links" )
                    .children( )
                    .eq( 2 )
                    .find( ".profile_count_link_total" )
                    .text( )
                    .trim( );

                callback( count )
            }
            catch ( exception )
            {
                callback( "unknown" );
            }
        }
    } );
}

jQuery( "#button_submit_manage" )
    .after( `<a class="ScreenshotManagementButton" id="button_del_all" href="javascript:;" style="margin-left: 32px; background-color: red; background-image: none;">전체 삭제</a>` );
jQuery( "#button_del_all" )
    .click( function( )
    {
        if ( !confirm( "이 계정의 모든 스크린샷을 삭제합니다, 계속하시겠습니까?" ) ) return;

        setModal( "모든 스크린샷을 불러오고 있습니다." );

        var Jdocument = jQuery( document );
        var lastPagePos = 0;

        var scrollBottomInterval = setInterval( function( )
        {
            Jdocument.scrollTop( Jdocument.height( ) );

            jQuery( "#loadingPageModal" )
                .center( );
        }, 100 );

        var bottomCheckInterval = setInterval( function( )
        {
            if ( lastPagePos === Jdocument.scrollTop( ) )
            {
                clearInterval( bottomCheckInterval );
                clearInterval( scrollBottomInterval );
                onSuccessScrollBottom( );
            }
            else
                lastPagePos = Jdocument.scrollTop( );
        }, 3000 );
    } );
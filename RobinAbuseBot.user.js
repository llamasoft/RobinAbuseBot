// ==UserScript==
// @name        RobinAbuseBot
// @version     1.1
// @namespace   https://github.com/llamasoft/RobinAbuseBot
// @supportUrl  https://github.com/llamasoft/RobinAbuseBot
// @updateUrl   https://github.com/llamasoft/RobinAbuseBot/raw/master/RobinAbuseBot.user.js
// @include     https://www.reddit.com/robin
// @include     https://www.reddit.com/robin/
// @require     https://code.jquery.com/jquery-1.12.0.min.js
// @run-at      document-idle
// @grant       GM_info
// ==/UserScript==
'use strict';



// Sends a message on behalf of the user
// Saves and reloads the text box contents as it gets cleared on submission
function sendMessage(message, makeBold) {
    var curText = $("#robinSendMessage > input[type='text']").val();

    if (makeBold) { message = embolden(message); }
    $("#robinSendMessage > input[type='text']").val(message);
    $("#robinSendMessage > input[type='submit']").click();
    console.log(message);

    $("#robinSendMessage > input[type='text']").val(curText);
}



// Converts ASCII text into unicode bold letterings
// Upper:  1D5D4 ('A' is offset 0)
// Lower:  1D5EE ('a' is offset 0)
// Number: 1D7EC ('0' is offset 0)
function embolden(str) {
    var rtn = '';

    for (var i = 0, len = str.length; i < len; i++) {
        var codePoint = str.codePointAt(i);

        if (codePoint >= 'A'.charCodeAt(0) && codePoint <= 'Z'.charCodeAt(0)) {
            codePoint = codePoint - 'A'.charCodeAt(0) + 0x1D5D4;

        } else if (codePoint >= 'a'.charCodeAt(0) && codePoint <= 'z'.charCodeAt(0)) {
            codePoint = codePoint - 'a'.charCodeAt(0) + 0x1D5EE;

        } else if (codePoint >= '0'.charCodeAt(0) && codePoint <= '9'.charCodeAt(0)) {
            codePoint = codePoint - '0'.charCodeAt(0) + 0x1D7EC;
        }

        rtn += String.fromCodePoint(codePoint);
    }

    return rtn;
}



function makeInsult() {
    var adjectives = [
        'stinking', 'smelly', 'ugly', 'witless', 'foul', 'evil', 'pointy-haired',
        'spineless', 'crappy', 'puppy-kicking', 'Nazi-loving', 'homeless', 'moronic', 'mother-loving',
        'idiotic', 'unoriginal', 'crack-smoking', 'salty', 'fat', 'self-important', 'vapid', 'sniveling',
        'grumbling', 'lazy', 'good-for-nothing', 'childish', 'fart-sniffing', 'promiscuous', 'awful',
        'hateful', 'spiteful', 'filthy', 'rancid', 'heinous', 'drooling', 'scruffy-looking', 'stuck-up',
        'half-witted', 'flaccid', 'dastardly', 'contemptible', 'cowardly', 'underhanded', 'vile',
        'despicable', 'rotten', 'worthless', 'abominable', 'repulsive', 'cotton-headed', 'ham-fisted',
        'slime-coated', 'dishonored', 'dirt-eating', 'slimy', 'walrus-looking', 'vulgar', 'one-eyed',
    ];

    var nouns = [
        'nincompoop', 'jerk', 'wanker', 'poop wizard', 'kumquat', 'troll', 'Trump supporter', 'rat',
        'dummy', 'bastard', 'nerf herder', 'pile of poo', 'dog fart', 'wart', 'dimwit', 'moron',
        'simpleton', 'twit', 'blockhead', 'jackass', 'oaf', 'halfling', 'ass clown', 'imbecile', 'mouth breather',
        'leprechaun', 'monster', 'sham', 'devil', 'poop stain', 'freak', 'nerd', 'horse beater', 'pimple',
        'lint licker', 'booger factory', 'shitlord', 'gutter slag', 'redneck', 'tool', 'pirate hooker',
        'bootlicker', 'cow tipper', 'baby shaker', 'loaf pincher', 'fart knocker', 'Wal-Mart greeter',
        'traitor', 'maggot burger', 'pimple farmer', 'paramecium brain', 'eunuch', 'pancake', 'cannibal',
        'numbnuts', 'bag of hammers', 'ninnymuggins',
    ];

    // Pick a random adjective and noun to make an insult
    var myAdjective = adjectives[ Math.floor(Math.random() * adjectives.length) ];
    var myNoun      =      nouns[ Math.floor(Math.random() * nouns.length     ) ];

    return myAdjective + ' ' + myNoun;
}



// Checks for abandoning users and slings insults at them
var prevTimestamp = null;
function checkForAbandons() {
    var lastMessage = $('div.robin-message.robin--message-class--action').last();
    var timestamp = $(lastMessage).find('time').attr('datetime');
    var user      = $(lastMessage).find('span.robin--username').text();
    var text      = $(lastMessage).find('span.robin-message--message').text();


    // Only run if this is a new action
    // We don't want to sling too much abuse
    if (timestamp == prevTimestamp) { return; }
    prevTimestamp = timestamp;


    // Time to get creative!
    if (text == 'voted to ABANDON') {
        sendMessage(user + ' is a ' + makeInsult(), true);
    }
}



// Say hello to the room, let them know that abandonment will not be tolerated
function greet() {
    var creator = 'Browsing_From_Work';
    var myUsername = $('span.user a').text();
    var robinUsers = $('#robinUserList .robin--username').map(
        function () { return $(this).text(); }
    ).get();

    // Load the version number, falling back to a default value
    var myVersion = 'v1.0b';
    if (typeof GM_info !== 'undefined') {
        myVersion = GM_info.script.version;
    }

    // How should we introduce ourselves?
    if (myUsername != creator && robinUsers.indexOf(creator) !== -1) {
        // If the creator is present, greet them
        sendMessage('ALL HAIL ' + creator.toUpperCase() + ', CREATOR OF ABUSE BOT', true);

    } else if (robinUsers.length < 30) {
        // Otherwise, announce your presence (assuming the room isn't too big)
        sendMessage(
            embolden('Abuse Bot v' + myVersion + ' loaded! ')
            + 'Abandoners will be harassed! ᕕ( ᐛ )ᕗ'
        );
    }


    // Let the insults begin!
    setInterval(checkForAbandons, 500);
}


// Say hello, then start slinging insults
setTimeout(greet, (Math.random() * 5 + 5) * 1000);


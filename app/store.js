import Baobab from 'baobab'
import axios from 'axios'


// Facets

let facets = {non_runner_jobs: {
    cursors: {jobs: ['jobs']},
    get: function(data) {
        //
    }
}}

// Load tree
var local_state = localStorage.state;

if(local_state != undefined) {
    local_state = JSON.parse(localStorage.getItem("state"));
} else {
    local_state = {jobs: {}, minions: {}, auth: {}}
}

var tree = new Baobab(local_state);

window.store = tree;

// Save tree
window.addEventListener("beforeunload", function(e){
    tree.unset("settings");
    localStorage.setItem("state", JSON.stringify(tree.get()));
}, false);

export default tree;

// Load settings
axios.get('/settings.json')
    .then(result => result.data)
    .then(settings => tree.set("settings", settings));

const route = (event) => {
	event = event || window.event;
	event.preventDefault();
	window.history.pushState({}, "", event.target.href);
	handleLocation();
};

const routes = {
	404 : "404.html",
	"/" : "pages/home.html",
	"/game" : "/pages/game.html",
	"/profile" : "/pages/profile.html",
	"/createUSer" : "/CreateUser.js",
};

const handleLocation = async () => {
	const path = window.location.pathname;
	const route = routes[path] || routes[404];
	const html = await fetch(route).then((data) => data.text());
	console.log(html)
	document.getElementById("test").innerHTML = html;
};

window.onpopstate = handleLocation;
window.route = route;

handleLocation();

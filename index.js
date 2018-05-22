const mount = require('koa-mount');
const fs = require('fs');
const Koa = require('koa');
const app = new Koa();

let {subapp,port }=require('./configure.json') 

//mount root app
const mount_on = (route, module_path)=>{
	let sub = require(module_path);
	route = route||`/${sub.name}`;
	app.use(mount(route, sub.app ) );
	console.log(`${sub.name} ${sub.version} on ${route} from ${module_path}`);
}


let {name,version} = require('./package.json');
app.use(async (ctx,next)=>{
	ctx.body = "";
	//TODO add support for https
	let url = ctx.request.header.host;
	subapp.forEach( (o)=>{
		let href = `'http://${url}${o.route}/'` ;
		ctx.body+=`<a href=${href}>${o['alias']||require(o['module_path']).name}</a></br>`
	});
	ctx.type='text/html; charset=utf-8';
	ctx.body = `<html> <body> ${ctx.body} </body> </html> `
	await next();
});

subapp.forEach( (o)=>{
	mount_on(o['route'], o.module_path);
});

if(!module.parent){
	port = port||8080;
	if( process.argv.length>=3 ){
		let arg = process.argv[2];
		port = Number.parseInt( arg );
		if( !Number.isInteger(port) || !(port>0&&port<65536) ){
			console.error(`port not available ${arg}`);
			process.exit(1);
		}
	}
	console.log(`${name} ${version} listening on ${port}`);
	app.listen(port);
}
else{
	module.exports = {
		name:name,
		version:version,
		app:app
	}
}

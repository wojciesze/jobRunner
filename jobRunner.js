const fs = require('fs');
const exec = require('child_process').exec;

try {
	json = JSON.parse(fs.readFileSync('jobs.json', 'utf-8'));
} catch(err) {
	console.log('ERROR reading json file: jobs.json')
	process.exit(1);
}


console.log("--- Welcome ---")

function start_job(jobname) {
		if (json[jobname].hasOwnProperty('finished') === false) {
			json[jobname].finished = 0;
			console.log('Starting: job: ' + jobname + ' cmd: ' + json[jobname].cmd)
			exec(json[jobname].cmd, function(error, stdin, stdout) {
				json[jobname].finished = 1;
				if (error) {
					json[jobname].exit_code = error.code;
					return 0;
				}
				json[jobname].exit_code = 0;
			})
		}	
}



function report() {
	for (job in json) {
		var finished = json[job].hasOwnProperty('finished') ? json[job].finished : 'undefined';
		var exit_code = json[job].hasOwnProperty('exit_code') ? json[job].exit_code : 'undefined';
		console.log('job=' + job + ' finished=' + finished + ' exit_code=' + exit_code);
	}
}


function main() {

	var main_finished = 0;
	var main_finished_OK = 0;
	for (job in json) {
		if (json[job].hasOwnProperty('finished')) {
			main_finished++;
			if (json[job].finished === 1) {
				main_finished_OK++;
			}
		}


		if (json[job].hasOwnProperty('depends') === false) {
			json[job].depends = []; 
		}
		var succ_cnt = 0;
		var finish_cnt = 0;
		for (var i=0; i<json[job].depends.length; i++) {
			var djob = json[job].depends[i];
			if (json[djob].hasOwnProperty('finished') && json[djob].finished === 1) {
				finish_cnt++
				if (json[djob].exit_code === 0) {
					succ_cnt++;
				} 
			} 
		}
		if (succ_cnt == json[job].depends.length) {
			start_job(job);
		}
	}

	if (main_finished_OK == main_finished) {
		report();
	} else {
		setTimeout(function() {
			main();
		}, 100);
	}
}

main()


UNITY='"C:/Program Files/Unity/Editor/Unity.exe"';
LOG_PATH='e:/tmp/build/unity-test.log';
TEST_RESULT_PATH='e:/tmp/build/unity-test-res.xml'

CMD_BUILD='-quit -batchmode -executeMethod Build.PerformWindows -projectPath E:/0mau/devel/unity/TDD2/TDD2 -runEditorTests -logFile e:/tmp/build/unity-build.log';
CMD_TEST=' -batchmode -projectPath E:/0mau/devel/unity/TDD2/TDD2 -runTests  -logFile '+LOG_PATH+' -testResults '+TEST_RESULT_PATH+' -testPlatform playmode';

const Proc = require('child_process');
const fs = require('fs');

const BUFF_SZ= 16384;
const POLL_DT= 2000;

function run_process() {

try { fs.unlinkSync(LOG_PATH); } catch(ex) {};
try { fs.unlinkSync(TEST_RESULT_PATH); } catch(ex) {};

var isOpen= true;
var sz_last= 0;
function poll() {
	var st= fs.stat(LOG_PATH,function (err,stats) {
		if (!err) { 
			console.log('stats',stats.size); 
			if (stats.size> sz_last) {
				fs.open(LOG_PATH,'r',null, function (err,fd) {
					var toRead= stats.size - sz_last;
					var buf= new Buffer(BUFF_SZ);
					function read() {
						fs.read(fd,buf,0,Math.min(BUFF_SZ, stats.size - sz_last), sz_last, function (err,cnt,data) {
							console.error("R "+data.slice(0,cnt).toString());
							sz_last+= cnt;
							if (sz_last < stats.size) { read() }
							else { setTimeout(poll,POLL_DT) }
						});
					};
					read();
				})	
			}
			else
			if (isOpen) { setTimeout(poll,POLL_DT) }
		}
		else {
			if (isOpen) { setTimeout(poll,POLL_DT) }
		}
	});
}
poll();
	
var ch= Proc.spawn(UNITY+' '+CMD_TEST, {shell: true});
ch.stdout.on('data', (data) => { console.log(`stdout: ${data}`); });
ch.stderr.on('data', (data) => { console.log(`stderr: ${data}`); });
ch.on('close', (code) => { 
	console.log(`child process exited with code ${code}`); 
	isOpen= false;
	setTimeout(() => processLog( () => process.exit(code)),2*POLL_DT);
});

}

function processLog(cb) {
	var res= fs.readFileSync(TEST_RESULT_PATH,'utf-8');
	var r= res.match(/(test-run[^>]*)/);
	console.error(r[1]);
	//res.replace(/\<test-case.*?fullname="([^"]+)".*?(result[^>]+).*?(failure(.*?)<\/failure)/g,
	res.replace(/\<test-case.*?fullname="([^"]+)".*?(result[^>]+)([^]*?)<\/test-case/g,
		function (x,name,result,cont) {
			var failure= cont.match(/failure>([^]*?)<\/failure/);
			console.error('TEST:'+name+':'+result+':'+(failure ? failure[1].replace(/[\r\n\t\s]+/g,' ') : 'OK'))
		});
	cb();
}
	

run_process();
console.log("Ejecutando");


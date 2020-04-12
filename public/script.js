var Timer;
var TotalSeconds;

function CreateTimer(TimerID, Time) {
  Timer = document.getElementById(TimerID);
  TotalSeconds = Time;
  UpdateTimer()
  window.setTimeout("Tick()", 1000);
}

function Tick() {
  TotalSeconds -= 1;
  if (TotalSeconds == -1) {
    alert("Time Up");

    document.getElementById('autoClick').click();
    alert("Odgovori uspješno spremljeni :)");
    window.close();
  } else {
    UpdateTimer()
    window.setTimeout("Tick()", 1000);
  }
}

function UpdateTimer() {
  Timer.innerHTML = TotalSeconds;
}

function myFunction() {

  document.getElementById("myDIV").classList.remove("hidden");
  document.getElementById("onclick").classList.add("hidden");
}

function myFunction1() {
  document.getElementById("myDIV").classList.add("hidden");
  document.getElementById("myDIV1").classList.remove("hidden");
}

function myFunction2() {
  document.getElementById("myDIV1").classList.add("hidden");
  document.getElementById("myDIV2").classList.remove("hidden");
}

function myFunction3() {
  document.getElementById("myDIV2").classList.add("hidden");
  document.getElementById("myDIV3").classList.remove("hidden");
}

function myFunction4() {
  document.getElementById("myDIV3").classList.add("hidden");
  document.getElementById("myDIV4").classList.remove("hidden");
}

function myFunction7() {
  document.getElementById("myDIV4").classList.add("hidden");
  document.getElementById("myDIV5").classList.remove("hidden");
}

function myFunction8() {
  document.getElementById("myDIV5").classList.add("hidden");
  document.getElementById("myDIV6").classList.remove("hidden");
}

//function myFunction5() {
//
//      if (Date.now() > new Date(1585674900)){
//        document.getElementById("hideTestButton").classList.add("hidden");
//
//        var time = 1000 * 60 * 0.01 //milisecond * second * minute
//        setTimeout(function(){
//        document.getElementById("hideTestButton").classList.remove("hidden");
//      }, time)
//      }      
//}

function myFunction6() {
  window.open("/probni_test", "winname", "directories=0,titlebar=0,toolbar=0,location=0,status=0,menubar=0,scrollbars=1,resizable=1");
}


document.getElementById("hideTestButton").addEventListener("click", hiddeButton);

function hiddeButton() {
  document.getElementById("hideTestButton").classList.add("hidden");
}


function myFunction9() {
  document.getElementById("autoClick1").click();
}
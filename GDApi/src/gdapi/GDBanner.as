package gdapi
{
	import flash.display.DisplayObject;
	import flash.display.Loader;
	import flash.display.LoaderInfo;
	import flash.display.MovieClip;
	import flash.display.Shape;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.TimerEvent;
	import flash.external.ExternalInterface;
	import flash.media.SoundMixer;
	import flash.media.SoundTransform;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.system.ApplicationDomain;
	import flash.system.LoaderContext;
	import flash.text.TextField;
	import flash.ui.Mouse;
	import flash.utils.Timer;
	import flash.utils.getQualifiedClassName;

	internal final class GDBanner extends EventDispatcher
	{
		private static var BannerServerURL:String = "bn.submityourgame.com";
		private static var StatsURL:String;
		private static var urlLoader:URLLoader;
		private static var urlRequest:URLRequest = new URLRequest();
		private static var loaderContext:LoaderContext;
		//private static const dispatcher:EventDispatcher = new EventDispatcher();		
		
		internal static var _bannerWidth:int=640;
		internal static var _bannerHeight:int=480;
		internal static var _bannerTop:int=0;
		internal static var _bannerLeft:int=0;
		internal static var _BannerTimeOut:int = 50;
		internal static var _bannerText:String = '';
		internal static var _bannerActive:Boolean = false;
		internal static var _bannerBGColor:String = '000000';		
		internal static var _bannerAutoSize:Boolean=false;
		internal static var _EnableBanner:Boolean=true;
		internal static var _HtmlBanner:Boolean=false;
		internal static var _MappedId:String = '';
		internal static var _AId:String = '';
		internal static var _UId:String = '';
		internal static var _MidRoll:Boolean=false;
		internal static var _isJSInjected:Boolean=false;
		internal static var _CurrentFrameRate:Number = 0.0;		
		internal static var _AndAdUnit:String = '';
		internal static var _AdUnit:String = '';
		internal static var _isMobile:Boolean = GDUtils.getOS()=="http://android.os";
		internal static var _GDAnalytics:GDAnalytics;	
		
		private static var blankScreen:MovieClip;
		private static var bannerTimer:Timer = new Timer(1000);
		private static var midRollTimer:Timer;
		private static var loader:Loader;
		private static var waitText:TextField;
		private static var bannerConfig:XML;
		private static var _bannerTopSpace:int=0;		
		private static var _bannerBottomSpace:int=0;
		private static var loaderBar:Shape;
		internal static var SitesCounter:int = 0;
		private static var _ShowBannerTimerText:Boolean=true;
		private static var _argsBanner:*=null;
		//private static var playBTN:playButton;
		private static var GoogleAds:*;
		
		
		public function GDBanner(_GDAnalyticsObj : GDAnalytics){
			_GDAnalytics = _GDAnalyticsObj;
		}
		
		internal function init(args:*):void {
			_argsBanner = args;

			GDUtils.RegisterJSCallBackFunction("jsGDO",jsGDO);
			GDUtils.RegisterJSCallBackFunction("jsPauseGame",jsPauseGame);
			GDUtils.RegisterJSCallBackFunction("jsResumeGame",jsResumeGame);				
			GDUtils.RegisterJSCallBackFunction("jsOnAdsStarted",jsOnAdsStarted);				
			GDUtils.RegisterJSCallBackFunction("jsOnAdsClosed",jsOnAdsClosed);				
			GDUtils.RegisterJSCallBackFunction("jsOnAdsError",jsOnAdsError);				
			GDUtils.RegisterJSCallBackFunction("jsOnAdsReady",jsOnAdsReady);
			GDUtils.RegisterJSCallBackFunction("jsOnAdsLoaded",jsOnAdsLoaded);
			jsInjectGD();
			
			ShowAd(null,true);
		}	 	
		
		internal function ShowAd(args:*=null,isPreRoll:Boolean=false):void {
			
			if (isPreRoll) {
				
				var minuteTimer:Timer = new Timer(120*1000,1); // 2min delay 
				minuteTimer.addEventListener(TimerEvent.TIMER_COMPLETE, function(event:TimerEvent):void {	
					GDUtils.CallJSFunction("jsShowBanner");	
					_GDAnalytics.jsSendEventGoogle("Ad","Requested Preroll");												
				}); 		
				minuteTimer.start(); 							
			}	
			else{										
				if(_MidRoll){								
					GDUtils.CallJSFunction("jsShowBanner");	
					_GDAnalytics.jsSendEventGoogle("Ad","Requested Midroll");
					_MidRoll = false;
				}							
			}		
			
		}
			
		public function jsPauseGame():String {
			try {
				_CurrentFrameRate = GDApi._Stage.frameRate;
				GDApi._Stage.frameRate=0.01;
				SoundMixer.soundTransform = new SoundTransform(0);
				
				_GDAnalytics.jsSendEventGoogle("Game","Paused");
			} catch (e:Error) {
				GDUtils.DebugLog("jsPauseGame: "+e.getStackTrace());				
			}
			return "{frameRate:\""+GDApi._Stage.frameRate+"\"}";			
		}

		public function jsResumeGame():String {
			GDApi._Stage.frameRate=_CurrentFrameRate;
			SoundMixer.soundTransform = new SoundTransform(1);
			_GDAnalytics.jsSendEventGoogle("Game","Resumed");
			return "{frameRate:\""+GDApi._Stage.frameRate+"\"}";			
		}		
		public function jsOnAdsLoaded(contentType:String):void{
			_GDAnalytics.jsSendEventGoogle("Ad","Loaded: "+contentType);
			dispatchEvent(new Event(GDEvent.BANNER_RECEIVED));
		}
		
		public function jsOnAdsStarted():void {
			//dispatchEvent(new Event(GDEvent.BANNER_STARTED));
		}
		
		public function jsOnAdsClosed():void {
			dispatchEvent(new Event(GDEvent.BANNER_CLOSED));
		}
		
		public function jsOnAdsError():void {
			_GDAnalytics.jsSendEventGoogle("Ad","Error");
			dispatchEvent(new Event(GDEvent.BANNER_CLOSED));
		}
		
		public function jsOnAdsReady():void {
			if (GDBanner._EnableBanner) {
				//GDUtils.CallJSFunction("jsShowBanner");
			}
		}
		
		public function jsGDO():String {
			return "{GDApi:\""+GDApi._ApiVersion+"\",GUID:\""+GDApi._GUID+"\",GID:\""+GDApi._GID+"\"}";
		}
		
		internal function jsInjectGD():Boolean {
			//return false;		
			if(ExternalInterface.available)
			{
				var today:Date = new Date();		
				try
				{					
					var script_js:XML =						
						<script>
						<![CDATA[
							(function()
							{
								(function(i,s,o,g,r,a,m)
									{
										i['FamobiGameObject']=r;
										i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)};
										i[r].l=1*new Date();
										a=s.createElement(o);
										m=s.getElementsByTagName(o)[0];
										a.async=1;
										a.src=g;
										m.parentNode.insertBefore(a,m);
									})(window,document,'script','http://vcheck.submityourgame.com/js/fgo.min.js','fgo');

									fgo("]]>{GDApi._GUID}<![CDATA[","]]>{_UId}<![CDATA[","]]>{_AId}<![CDATA[");
							})
						]]>						
						</script>;						
					ExternalInterface.call(script_js);
					_isJSInjected = true;
					GDUtils.DebugLog('jsInjectGD: true');
					return true;
				}
				catch(s:Error)
				{
					GDUtils.DebugLog('jsInjectGD: false');
					return false;
				}
			}	
			
			return false;
		}		
		internal function CloseBanner():void {
			if (GoogleAds!=null && GoogleAds.destroy!=null) {
				GoogleAds.destroy();
			}
		}		
		
		private function Fail(e:Event):void
		{
			var request:URLLoader = e.target as URLLoader;
			GDUtils.DebugLog('Fail: '+e+' : '+request.data);
			dispatchEvent(new Event(GDEvent.BANNER_CLOSED));			
		}
		
		private function HTTPStatusIgnore(e:Event):void
		{
		}	
		private function parseDomain(WebRef:String):String {
			var WebArray:Array = WebRef.replace('http://','').split('/');
			return WebArray[0];			
		}		

	}
}
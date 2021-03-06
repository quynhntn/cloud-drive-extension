/**
 * Dropbox support for eXo Cloud Drive.
 * 
 */
(function($, cloudDrive, utils) {

	/**
	 * Dropbox connector class.
	 */
	function DropboxClient() {
		var PROVIDER_ID = "dropbox";

		var prefixUrl = utils.pageBaseUrl(location);

		var changes;
		
		var changesTimeout;

		var pollChanges = function(process, drive, timeout) {
			timeout = timeout && typeof timeout === "number" ? timeout : 2000;
			//utils.log(">>> poll next changes in " + timeout + "ms for Cloud Drive " + drive.path);
			clearTimeout(changesTimeout);
			// wait the timeout, get actual drive state and run delta check (w/ fresh longpoll url)
			changesTimeout = setTimeout(function() {
				var newState = cloudDrive.getState(drive);
				newState.done(function(res) {
					drive.state = res;
					var changesUrl = drive.state.url;
					if (changes) {
						if (changes.url == changesUrl) {
							// do nothing, polling already in progress
							return;
						} else {
							// cancel previous longpoll request
							changes.request.abort();	
						}
					}
					// get-and-wait longpoll delta from Dropbox
					changes = cloudDrive.ajaxGet(changesUrl);
					changes.done(function(info, status) {
						changes = null;
						var timeout = 1;
						if (info.changes) {
							process.resolve();
							timeout = 30000; // next sync in 30 sec since the last change
						} else if (info.backoff && typeof info.backoff === "number") {
							timeout = info.backoff * 1000; // changes w/ backoff (convert sec to ms)
						} else {
							timeout = 10000; // next sync in 10 sec when changes w/o backoff
						}
						pollChanges(process, drive, timeout); // continue with a timeout
					});
					changes.fail(function(response, status, err) {
						changes = null;
						// if not aborted by backoffTimeout timer or browser
						if (err != "abort") {
							if (response && response.error) {
								process.reject("Long-polling changes request error. " + response.error + ". " + err + " (" + status + ")");
							} else {
								process.reject("Long-polling changes request failed. " + err + " (" + status + ") " + JSON.stringify(response));
							}
						} else {
							process.reject("Long-polling changes request aborted");
						}
					});
				});
				newState.fail(function(response, status, err) {
					process.reject("Error getting drive state. " + err + " (" + status + ")");
				});
			}, timeout);
		};

		/**
		 * Check if Dropbox has remote changes. Return jQuery Promise object that will be resolved when
		 * some change will appear, or rejected on error. It is a method that Cloud Drive core client
		 * will look for when loading the connector module.
		 * 
		 * Cloud Drive client expects that connector's `onChange()` method returns jQuery Promise and
		 * then it uses the promise to initiate synchronization process. When the promise will be
		 * resolved (its `.resolve()` invoked), it will mean the drive has new remote changes and client
		 * will invoke the synchronization web-service and then refresh the UI. If promise rejected
		 * (`.reject(error)` invoked) then the synchronization will be canceled, and a new
		 * synchronization will be attempted when an user perform an operation on the Documents page
		 * (navigate to other file or folder, use Cloud Drive menu).
		 * 
		 * Thanks to use of jQuery Promise drive state synchronization runs asynchronously, only when an
		 * actual change will happen in the drive.
		 */
		this.onChange = function(drive) {
			var process = $.Deferred();

			if (drive) {
				// utils.log(">>> enabling changes monitor for Cloud Drive " + drive.path);
				if (drive.state) {
					// Drive supports state - thus we can send connector specific data via it from Java API
					// State it is a POJO in JavaAPI. Here it is a JSON object.
					pollChanges(process, drive);
				} else {
					process.reject("Cannot check for changes. No state object for Cloud Drive on " + drive.path);
				}
			} else {
				process.reject("Null drive in onChange()");
			}
			return process.promise();
		};

		/**
		 * Initialize Dropbox client on its load on the page (or the page fragment update).
		 */
		this.onLoad = function(provider) {
			// Add an action to "show plain text" tab to load the frame content to the code viewer
			$(function() {
				cloudDrive.initTextViewer();

				// we also want use preview link as download link for not viewable files
				var file = cloudDrive.getContextFile();
				if (file) {
					var $notViewable = $(".NotViewable a.btn");
					$notViewable.attr("href", file.previewLink);
				}
			});
		};
	}

	if (window == top) {// run only in window (not in iframe as gadgets may do)
		try {
			// load codemirror styles
			utils.loadStyle("/cloud-drive/skin/codemirror.css");
		} catch(e) {
			utils.log("Error intializing Dropbox client.", e);
		}
	}

	return new DropboxClient();
})($, cloudDrive, cloudDriveUtils);

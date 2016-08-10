/**
 *
 *	Client Ã©crit par RedSky
 * 		Rien d'exceptionnel, ceci dit si vous avez des questions sur son fonctionnement n'hÃ©sitez pas
 *   	Ce code est dit "obfusquÃ© naturellement". C'est Ã  dire qu'il est tellement mal conÃ§u et mal pensÃ©
 *   	Qu'il est peine perdue de tenter de le recopier
 *    		â™¥
 *
 */



function SkyChatClient( ) {

}
	SkyChatClient.prototype = {
		"connected" 			: false 		,
		"logged" 				: false 		,
		"config" 				: undefined 	,
		"sock" 					: undefined 	,
		"all_connected" 		: {} 			,
		"events" 				: ['connect','play_sound','disconnect','pseudo_info','message','error','info','success','room_list','room_update','room_info','yt_room_history',,'yt_room_waitlist','yt_sync','yt_search','connected_list','typing_list','mouse_position','mouse_destroy'] ,
		"event_listeners" 		: {}
	}


		SkyChatClient.prototype.init = function( config ) {
			this.config 	= config ;
			this.sock 		= io.connect( "http://"+this.config.url+":"+this.config.port );
			this.sock.data 	= {} ;
			this.bindSock( );
		} // --\ init -> bindSock
			SkyChatClient.prototype.bindSock = function( ) {
				for( var i = 0 ; i < this.events.length ; i++ ) {
	                (
	                    function( pEvtID ) {
	                        var evt = {
	                            "id"        : pEvtID            	,
	                            "target"    : this.sock 			,
	                            "name"      : this.events[pEvtID]
	                        } ;

	                        this.sock.on( evt.name , ( function( pData ) {
	                            this.forwardEvent( evt , pData || {} );
	                        } ).bind( this ) );
	                    }
	                ).bind( this, i ).apply();;
	            }
			} // --\ bindSock -> forwardEvent
	            SkyChatClient.prototype.forwardEvent = function( pEvt, pData ) {
	            	pEvt 	= typeof( pEvt ) === "string" ? {"name":pEvt} : pEvt ;
	            	pData 	= pData || {} ;
	                if( typeof( this["event_"+pEvt.name] ) === "function" )
	                    this["event_"+pEvt.name]( pEvt, pData );
	                this["event_star"]( pEvt, pData );

	                if( typeof( this.event_listeners[ pEvt.name ] ) !== "undefined" ) {
	                	for( var i in this.event_listeners[ pEvt.name ] ) {
	                		this.event_listeners[ pEvt.name ][i]( pEvt, pData );
	                	}
	                }
	            } // --\ forwardEvent -> event_*
					SkyChatClient.prototype.event_star 			= function( pEvt, pData ) {
						// fired for every event
					}
					SkyChatClient.prototype.event_connect 		= function( pEvt, pData ) {
						this.connected 		= true ;
						this.log();
					}
					SkyChatClient.prototype.event_disconnect 	= function( pEvt, pData ) {
						this.connected 		= false ;
						this.logged 		= false ;
					}
					SkyChatClient.prototype.event_pseudo_info 	= function( pEvt, pData ) {
						if( ! this.already_got_pseudo_info ) {
							this.sock.data.storage = pData.storage ;
							this.already_got_pseudo_info = true ;
						}

						var mask_update = false ;
						if(
							   !this.sock.data.storage.masks
							|| (this.sock.data.storage.masks.length !== pData.storage.masks.length)
							|| this.sock.data.storage.masks_selected !== pData.storage.masks_selected ) {
							mask_update = true ;
						}
						var cursor_update = false ;
						if(
							   !this.sock.data.storage.cursors
							|| (this.sock.data.storage.cursors.length !== pData.storage.cursors.length)
							|| this.sock.data.storage.cursors_selected !== pData.storage.cursors_selected ) {
							cursor_update = true ;
						}

						var old_room = this.getCurrentRoom() ;
						this.logged = this.sock.data.logged === true ;
						this.sock.data = pData ;


						if( old_room !== pData.current_room ) {
							this.forwardEvent("room_change");
						}
						if( mask_update === true ) {
							this.forwardEvent("masks_change",this.sock.data.mask);
						}
						if( cursor_update === true ) {
							this.forwardEvent("cursors_change",this.sock.data.cursor);
						}
					}
					SkyChatClient.prototype.event_message 		= function( pEvt, pData ) {
					}
					SkyChatClient.prototype.event_yt_room_history = function( pEvt, pData ) {
					}
					SkyChatClient.prototype.event_connected_list = function( pEvt, pData ) {
						var new_connected = [] ;
						for( var i in pData.list ) {
							if( typeof( this.all_connected[ pData.list[i].pseudo_lower ] ) === "undefined" )
								this.forwardEvent( "user_joined" , pData.list[i] );
							this.all_connected[ pData.list[i].pseudo_lower ] = pData.list[i] ;
							new_connected.push( pData.list[i].pseudo_lower );
						}


						for( var i in this.all_connected ) {
							if( new_connected.indexOf( this.all_connected[i].pseudo_lower ) !== -1 ) continue ;
							this.forwardEvent( "user_left" , this.all_connected[i] );
							delete this.all_connected[i] ;
						}
					}
					SkyChatClient.prototype.event_room_change 	= function( pEvt, pData ) {
						this.all_connected = {} ;
					}

			SkyChatClient.prototype.addEventListener = function( pEvtName, pFunc ) {
				if( typeof( this.event_listeners[ pEvtName ] ) === "undefined" )
					this.event_listeners[ pEvtName ] = [] ;
				this.event_listeners[ pEvtName ].push( pFunc );
			}
		SkyChatClient.prototype.log = function( ) {
			if( this.connected === false || this.logged === true || ! this.config || ! this.config.credentials ) return false;
			this.sock.emit("log",this.config.credentials);
			return true ;
		}

		SkyChatClient.prototype.getPseudo = function( ) {
			return ( this.connected===true && typeof(this.sock.data)!=="undefined" ) ? this.sock.data.pseudo : "" ;
		}


		SkyChatClient.prototype.sendMessage = function( pMessage ) {
			if( this.connected === false ) return false ;
			this.sock.emit("message",{"message":pMessage});
			return true ;
		}
			SkyChatClient.prototype.sendMP = function( pPseudo, pMessage ) {
				if( this.connected === false ) return false ;
				this.sendMessage("/w "+pPseudo+" "+pMessage);
				return true ;
			}
			SkyChatClient.prototype.joinRoom = function( pRoomID ) {
				this.sendMessage("/join "+pRoomID);
			}
			SkyChatClient.prototype.YTSearch = function( pTxt ) {
				this.sendMessage("/yt search "+pTxt);
			}
			SkyChatClient.prototype.YTPlay = function( pVideo ) {
				this.sendMessage("/yt play "+pVideo);
			}
			SkyChatClient.prototype.YTSync = function( ) {
				this.sendMessage("/yt sync");
			}
		SkyChatClient.prototype.updateTyping = function( pState ) {
			this.sock.emit("typing",{"currently_typing":pState===true});
		}

		SkyChatClient.prototype.getCurrentRoom = function( ) {
			return ( this.connected === false || ! this.sock.data || typeof(this.sock.data.current_room)==="undefined" || this.sock.data.current_room === false ) ? -1 : this.sock.data.current_room ;
		}
		SkyChatClient.prototype.askRoomList = function( ) {
			if( this.connected === false ) return false ;
			this.sendMessage("/roomlist");
		}
		SkyChatClient.prototype.updateAvatar = function( pLink ) {
			if( this.connected === false ) return false ;
			this.sendMessage("/avatar "+pLink);
		}

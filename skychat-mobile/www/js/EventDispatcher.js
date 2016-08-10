"use strict"

class EventDispatcher {
    constructor() {
        this.event_listeners    = {} ;
    }
    hasEventListener( pEventName ) {
        return typeof( this.event_listeners[ pEventName ] ) !== "undefined" ;
    }
    addEventListener( pEventName, pCallBack ) {
        if( ! this.hasEventListener( pEventName ) )
            this.event_listeners[ pEventName ] = [];
        this.event_listeners[ pEventName ].push( pCallBack );
    }
    removeEventListener( pEventName, pCallBack ) {
        if( ! this.hasEventListener( pEventName ) )
            return false ;
        if( pCallBack ) {
            for( var i = 0 ; i < this.event_listeners[ pEventName ].length ; i++ ) {
                if( this.event_listeners[ pEventName ][i] == pCallBack ) {
                    this.event_listeners[ pEventName ].splice( i, 1 );
                    if( this.event_listeners[ pEventName ].length === 0 )
                        delete this.event_listeners[ pEventName ] ;
                    return true ;
                }
            }
            return false ;
        } else {
            delete this.event_listeners[ pEventName ];
            return true ;
        }
    }
    forwardEvent( pEventName, pData ) {
        if( ! this.hasEventListener( pEventName ) ) return false ;
        pData               = pData             || {} ;
        var evt_obj         = {
            "name" : pEventName ,
            "target" : this
        }
        for( var i = 0 ; i < this.event_listeners[pEventName].length ; i++ ){
            this.event_listeners[pEventName][i].bind(this, evt_obj, pData).apply();
        }
    }
};

module.exports = EventDispatcher;

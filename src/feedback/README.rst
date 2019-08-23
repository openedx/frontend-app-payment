feedback module
===============

The feedback module is an alert manager.  It provides components and actions actions to manage adding messages to and removing messages from the top of the page.  Under the covers it uses Paragon's StatusAlert component to do this.

The actions of the feedback module are used frequently in sagas in order to display server-side error, info, and warning messages to the user.

Components
--------------

**AlertList**

This is connected to the redux store and coordinates a list of alert messages.

**AlertMessage**

A thin wrapper around StatusAlert.

**FallbackErrorMessage**

This is displayed if we receive a special "fallback-error" code as part of a message.  It generally means an error has occurred that we don't otherwise know how to handle.  Primarily this can happen when an Error object is provided to the handleErrors saga described below.

Actions
-------

**addMessage**

Appends another message to the end of the list of status alerts.

**removeMessage**

Removes a message by its feedback-assigned identifier.  As messages are recorded in the feedback module, it assigns incremental IDs to them.  These IDs can later be used to remove messages from the module.

**clearMessages**

This removes all messages from the feedback module.  This is often used when we're certain that none of the older messages are pertinent anymore; maybe after a user re-submits a form.

Sagas
-----

The feedback module supplies some sagas that can be used as helpers for processing errors and messages that conform to our standard message format.

**handleErrors**

This can be used when an API returns an error.  It takes the error as an argument, and will process any messages it finds in the "errors", "messages", or "fieldErrors" arrays on that error.  If none of the above exist, it will generate a "fallback-error"

**handleMessages**

Whereas handleErrors above looks in the "messages" array on the error, handleMessages takes a list of messages directly.  This is helpful if a successful server response contains a list of messages for the user.
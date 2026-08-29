// Brilliants — Supabase Configuration
// Shared config for Partner Management System
// ============================================================

var BRILLIANTS_SUPABASE = {
  URL: 'https://ekjakdhxodugncdpwkrj.supabase.co',
  ANON_KEY: 'sb_publishable_wfkvHgTcFlVdWOqbGRfpOA_O2pGf7YS'
};

// Supabase client helper (lightweight — no SDK dependency)
var SupabaseClient = (function() {
  'use strict';

  var config = BRILLIANTS_SUPABASE;

  function headers(authToken) {
    var h = {
      'Content-Type': 'application/json',
      'apikey': config.ANON_KEY,
      'Prefer': 'return=representation'
    };
    if (authToken) h['Authorization'] = 'Bearer ' + authToken;
    return h;
  }

  function getToken() {
    try {
      var session = JSON.parse(localStorage.getItem('brilliants_partner_session') || 'null');
      return session ? session.access_token : null;
    } catch(e) { return null; }
  }

  function setSession(session) {
    localStorage.setItem('brilliants_partner_session', JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem('brilliants_partner_session');
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem('brilliants_partner_session') || 'null');
    } catch(e) { return null; }
  }

  // Auth: Sign up with email
  function signUp(email, password, metadata) {
    return fetch(config.URL + '/auth/v1/signup', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        email: email,
        password: password,
        data: metadata || {}
      })
    }).then(function(r) { return r.json(); });
  }

  // Auth: Sign in with email
  function signIn(email, password) {
    return fetch(config.URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email: email, password: password })
    }).then(function(r) { return r.json(); });
  }

  // Auth: Get current user
  function getUser(accessToken) {
    return fetch(config.URL + '/auth/v1/user', {
      method: 'GET',
      headers: headers(accessToken || getToken())
    }).then(function(r) { return r.json(); });
  }

  // Auth: Sign out
  function signOut() {
    clearSession();
    return Promise.resolve();
  }

  // REST: Select
  function select(table, query, authToken) {
    var url = config.URL + '/rest/v1/' + table + '?' + query;
    return fetch(url, {
      method: 'GET',
      headers: headers(authToken || getToken())
    }).then(function(r) { return r.json(); });
  }

  // REST: Insert
  function insert(table, data, authToken) {
    return fetch(config.URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: headers(authToken || getToken()),
      body: JSON.stringify(data)
    }).then(function(r) { return r.json(); });
  }

  // REST: Update
  function update(table, query, data, authToken) {
    return fetch(config.URL + '/rest/v1/' + table + '?' + query, {
      method: 'PATCH',
      headers: headers(authToken || getToken()),
      body: JSON.stringify(data)
    }).then(function(r) { return r.json(); });
  }

  // REST: RPC (call stored function)
  function rpc(functionName, params, authToken) {
    return fetch(config.URL + '/rest/v1/rpc/' + functionName, {
      method: 'POST',
      headers: headers(authToken || getToken()),
      body: JSON.stringify(params || {})
    }).then(function(r) { return r.json(); });
  }

  return {
    config: config,
    getToken: getToken,
    setSession: setSession,
    clearSession: clearSession,
    getSession: getSession,
    signUp: signUp,
    signIn: signIn,
    getUser: getUser,
    signOut: signOut,
    select: select,
    insert: insert,
    update: update,
    rpc: rpc
  };
})();

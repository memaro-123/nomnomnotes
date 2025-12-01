// File: server/wrappedQuery.js; meant to make it easier to generate spotify wrapped knockoff reports for the user's food diary, named BiteBack
// realized that generating the report live would maybe strain the database since it is a bunch of queries, so perhaps it is better if this is something that happens once a set time period for all users and saves the data into a new 
// that way when the user wants their report, the api endpoint can simply fetch the precalculated data and make it load faster


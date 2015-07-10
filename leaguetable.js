TeamList = new Mongo.Collection('teams');

if(Meteor.isServer) {

  Meteor.publish("teamList", function(){
    return TeamList.find();
  })

  Meteor.methods({
    'modifyPoint': function(team, point){
      TeamList.update({ _id: team}, {$inc: {point: point}});
    },
    'insertTeam': function(team) {
      TeamList.insert({name: team, point: 0});
    },
    'resetPoint': function(team) {
      TeamList.update({}, {$set: {point: 0}}, {multi: true});
    },
    'deleteTeam': function(team) {
      TeamList.remove({ _id: team});
    }
  });
}

if(Meteor.isClient) {

  Meteor.subscribe("teamList");

  Template.league.helpers({
      'team': function() {
        return TeamList.find({}, {sort: {point: -1, name: 1}});
      },
      'selected': function() {
        var teamId = this._id;
        var selectedTeam = Session.get('selectedTeam');
        if(teamId == selectedTeam)
          return 'selected';
      }
  });

  Template.league.events({
      'click .teamRow': function(){
        var teamId = this._id;
        Session.set('selectedTeam', teamId);
      },
      'click .win': function(){
        var selectedTeam = Session.get('selectedTeam');
        Meteor.call('modifyPoint', selectedTeam, 3);
      },
      'click .draw': function(){
        var selectedTeam = Session.get('selectedTeam');
        Meteor.call('modifyPoint', selectedTeam, 1);
      },
      'click .reset': function(){
        Meteor.call('resetPoint');
      },
      'click .delete': function(){
        var selectedTeam = Session.get('selectedTeam');
        Meteor.call('deleteTeam', selectedTeam);
      }
  });

  Template.control.events({
      'submit form': function(event){
        event.preventDefault();
        var teamName = event.target.inputTeam.value;
        Meteor.call('insertTeam', teamName);
      }
  });
}
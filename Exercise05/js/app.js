
// Create the all up Ember application
var SuperWebApp_Reader = Em.Application.create({
  ready: function() {
    // Call the superclass's `ready` method.
    this._super();

    /* Exercise 5.4 */
  }
});

// Ember Object model for entry items
SuperWebApp_Reader.Item = Em.Object.extend({
  read: false,
  starred: false,
  item_id: null,
  title: null,
  pub_name: null,
  pub_author: null,
  pub_date: new Date(0),
  short_desc: null,
  content: null,
  feed_link: null,
  item_link: null
});

SuperWebApp_Reader.GetItemsFromServer = function() {
  /* Exercise 5.1 */
};

SuperWebApp_Reader.dataController = Em.ArrayController.create({
  // content array for Ember's data
  content: [],

  // Adds an item to the controller if it's not already in the controller
  addItem: function(item) {
    // Check to see if there are any items in the controller with the same
    //  item_id already
    var exists = this.filterProperty('item_id', item.item_id).length;
    if (exists === 0) {
      // If no results are returned, we insert the new item into the data
      // controller in order of publication date
      var length = this.get('length'), idx;
      idx = this.binarySearch(Date.parse(item.get('pub_date')), 0, length);
      this.insertAt(idx, item);
      return true;
    } else {
      // It's already in the data controller, so we won't re-add it.
      return false;
    }
  },

  // Binary search implementation that finds the index where a entry
  // should be inserted when sorting by date.
  binarySearch: function(value, low, high) {
    var mid, midValue;
    if (low === high) {
      return low;
    }
    mid = low + Math.floor((high - low) / 2);
    midValue = Date.parse(this.objectAt(mid).get('pub_date'));

    if (value < midValue) {
      return this.binarySearch(value, mid + 1, high);
    } else if (value > midValue) {
      return this.binarySearch(value, low, mid);
    }
    return mid;
  },

  // A 'property' that returns the count of items
  itemCount: function() {
    return this.get('length');
  }.property('@each'),

  // A 'property' that returns the count of read items
  readCount: function() {
    return this.filterProperty('read', true).get('length');
  }.property('@each.read'),

  // A 'property' that returns the count of unread items
  unreadCount: function() {
    return this.filterProperty('read', false).get('length');
  }.property('@each.read'),

  // A 'property' that returns the count of starred items
  starredCount: function() {
    return this.filterProperty('starred', true).get('length');
  }.property('@each.starred')
});

// Visible Item Controller - we never really edit any of the content
//  in here, it's solely used to decide what we're showing, pulling from
//  the data controller.
SuperWebApp_Reader.itemsController = Em.ArrayController.create({
  // content array for Ember's data
  content: [],

  // Sets content[] to the filtered results of the data controller
  filterBy: function(key, value) {
    this.set('content', SuperWebApp_Reader.dataController.filterProperty(key, value));
  },

  // Sets content[] to all items in the data controller
  clearFilter: function() {
    this.set('content', SuperWebApp_Reader.dataController.get('content'));
  },

  // Shortcut for filterBy
  showDefault: function() {
    this.filterBy('read', false);
  },

  // Mark all visible items read
  markAllRead: function() {
    // Iterate through all items, and set read=true in the item controller
    this.forEach(function(item) {
      item.set('read', true);
    });
  },

  // A 'property' that returns the count of visible items
  itemCount: function() {
    return this.get('length');
  }.property('@each'),

  // A 'property' that returns the count of read items
  readCount: function() {
    return this.filterProperty('read', true).get('length');
  }.property('@each.read'),

  // A 'property' that returns the count of unread items
  unreadCount: function() {
    return this.filterProperty('read', false).get('length');
  }.property('@each.read'),

  // A 'property' that returns the count of starred items
  starredCount: function() {
    return this.filterProperty('starred', true).get('length');
  }.property('@each.starred')

});


// Top Menu/Nav Bar view
SuperWebApp_Reader.NavBarView = Em.View.extend({
  // A 'property' that returns the count of items
  itemCount: function() {
    return SuperWebApp_Reader.dataController.get('itemCount');
  }.property('SuperWebApp_Reader.dataController.itemCount'),

  // A 'property' that returns the count of unread items
  unreadCount: function() {
    return SuperWebApp_Reader.dataController.get('unreadCount');
  }.property('SuperWebApp_Reader.dataController.unreadCount'),

  // A 'property' that returns the count of starred items
  starredCount: function() {
    return SuperWebApp_Reader.dataController.get('starredCount');
  }.property('SuperWebApp_Reader.dataController.starredCount'),

  // A 'property' that returns the count of read items
  readCount: function() {
    return SuperWebApp_Reader.dataController.get('readCount');
  }.property('SuperWebApp_Reader.dataController.readCount'),

  // Click handler for menu bar
  showAll: function() {
    SuperWebApp_Reader.itemsController.clearFilter();
  },

  // Click handler for menu bar
  showUnread: function() {
    SuperWebApp_Reader.itemsController.filterBy('read', false);
  },

  // Click handler for menu bar
  showStarred: function() {
    SuperWebApp_Reader.itemsController.filterBy('starred', true);
  },

  // Click handler for menu bar
  showRead: function() {
    SuperWebApp_Reader.itemsController.filterBy('read', true);
  },

  // Click handler for menu bar
  refresh: function() {
    SuperWebApp_Reader.GetItemsFromServer();
  }
});

// View for the ItemsList
SuperWebApp_Reader.SummaryListView = Em.View.extend({
  tagName: 'article',

  classNames: ['well', 'summary'],

  classNameBindings: ['read', 'starred'],

  // Enables/Disables the read CSS class
  read: function() {
    var read = this.get('content').get('read');
    return read;
  }.property('SuperWebApp_Reader.itemsController.@each.read'),

  // Enables/Disables the read CSS class
  starred: function() {
    var starred = this.get('content').get('starred');
    return starred;
  }.property('SuperWebApp_Reader.itemsController.@each.starred'),

  // Returns the date in a human readable format
  formattedDate: function() {
    var d = this.get('content').get('pub_date');
    return moment(d).format('MMMM Do, YYYY');
  }.property('SuperWebApp_Reader.itemsController.@each.pub_date')
});


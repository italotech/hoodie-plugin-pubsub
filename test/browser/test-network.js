suite('network', function () {
  this.timeout(15000);

  suite('network test', function () {

    test('signIn hommer', function (done) {
      this.timeout(15000);
      hoodie.account.signIn('Hommer', '123')
        .fail(function (err) {
          done();
          assert.ok(false, err.message);
        })
        .done(function () {
          assert.equal(
            hoodie.account.username,
            'hommer',
            'should be logged in after signup'
          );
          done();
        });
    });

    test('hommer showd subscribe bart posts', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Bart' }).hoodieId, 'singlepost')
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          done();
          assert.ok(true, 'follow with sucess');
        });
    });

    test('hommer not should subscribe bart posts', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Bart' }).hoodieId, 'singlepost')
        .fail(function (err) {
          done();
          assert.ok((err.message ==='You already subscribed.'), err.message);
        })
        .then(function () {
          done();
          assert.ok(false, 'should throw error [You already subscribed.] ');
        });
    });

    test('hommer showd subscribe marge posts', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Margie' }).hoodieId, 'singlepost')
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('hommer showd subscribe lisa posts', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Lisa' }).hoodieId, 'singlepost')
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('hommer showd bidirectional Krust posts', function (done) {
      this.timeout(15000);
      hoodie.pubsub.bidirectional(_.find(window.fixtures.users, { username: 'Krust' }).hoodieId, 'singlepost')
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('hommer showd bidirectional Lenny posts', function (done) {
      this.timeout(15000);
      hoodie.pubsub.bidirectional(_.find(window.fixtures.users, { username: 'Lenny' }).hoodieId, 'singlepost')
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

   test('hommer should show 2 subscribers', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscribers()
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function (task) {
          assert.ok((task.pubsub.subscribers.length === 2) , 'subscribers ' + task.pubsub.subscribers.length + ' with sucess');
          done();
        });
    });

   test('hommer should show 5 subscriptions', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscriptions()
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function (task) {
          assert.ok((task.pubsub.subscriptions.length === 5) , 'subscriptions ' + task.pubsub.subscriptions.length + ' with sucess');
          done();
        });
    });


    test('hommer showd unsubscribe bart posts', function (done) {
      this.timeout(15000);
      hoodie.pubsub.unsubscribe(_.find(window.fixtures.users, { username: 'Bart' }).hoodieId, 'singlepost')
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('hommer showd unbidirectional Lenny posts', function (done) {
      this.timeout(15000);
      hoodie.pubsub.unbidirectional(_.find(window.fixtures.users, { username: 'Lenny' }).hoodieId, 'singlepost')
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('hommer showd subscribe Cat chat and only lisa must recive', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Cat' }).hoodieId, 'singlepost', true)
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('hommer showd subscribe Dog chat and only lisa must recive', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Dog' }).hoodieId, 'singlepost', true)
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('Dog showd subscribe hommer', function (done) {
      signinUser('dog', 123, function () {
        hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Hommer' }).hoodieId, 'singlepost', true)
          .fail(function (err) {
            done((err.message !=='You already subscribed.')? err: null);
            assert.ok(false, err.message);
          })
          .then(function () {
            assert.ok(true, 'follow with sucess');
            done();
          });
      })
    })

    test('Lisa showd subscribe hommer', function (done) {
      signinUser('lisa', 123, function () {
        hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Hommer' }).hoodieId, 'singlepost', true)
          .fail(function (err) {
            assert.ok(false, err.message);
            done(err);
          })
          .then(function () {
            assert.ok(true, 'follow with sucess');
            done();
          });
      })
    })


    test('hommer showd create a post document', function (done) {
      this.timeout(15000);
      signinUser('hommer', 123, function () {
        hoodie.store.add('singlepost', { text: 'my post doh!',  userId: _.find(window.fixtures.users, { username: 'Hommer' }).hoodieId} )
          .fail(function (err) {
            done((err.message !=='You already subscribed.')? err: null);
            assert.ok(false, err.message);
          })
          .then(function () {
            assert.ok(true, 'follow with sucess');
            done();
          });
      });
    });

    test('hommer showd create a post document exclusive', function (done) {
      this.timeout(15000);
      hoodie.store.add('singlepost', { text: 'au au au',  userId: _.find(window.fixtures.users, { username: 'Hommer' }).hoodieId, exclusive: [ _.find(window.fixtures.users, { username: 'Dog' }).hoodieId ] } )
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('Lisa showd have the post from hommer', function (done) {
      signinUser('lisa', 123, function () {
        hoodie.store.findAll('singlepost')
          .then(function (docs) {
            assert.ok(docs.length === 1, 'has a post from hommer');
            done();
          })
          .fail(function (err) {
            done((err.message !=='You already subscribed.')? err: null);
            assert.ok(false, err.message);
          });
      })
    })

    test('Dog showd have the posts from hommer include the exclusive one', function (done) {
      signinUser('dog', 123, function () {
        hoodie.store.findAll('singlepost')
          .then(function (docs) {
            assert.ok(docs.length === 2, 'has 2 posts from hommer');
            done();
          })
          .fail(function (err) {
            done((err.message !=='You already subscribed.')? err: null);
            assert.ok(false, err.message);
          });
      })
    })

  });

});

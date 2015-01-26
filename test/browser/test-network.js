suite('network', function () {
  this.timeout(15000);

  suiteSetup(loadUsers);
  suite('network test', function () {


    setup(function (done) {
      this.timeout(15000);
      localStorage.clear();
      hoodie.account.signIn('Hommer', '123')
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .done(function () {
          done();
        });
    });

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
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Bart' }).hoodieId, 'post')
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
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Bart' }).hoodieId, 'post')
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
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Margie' }).hoodieId, 'post')
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
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Lisa' }).hoodieId, 'post')
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

   test('hommer should show 0 subscribers', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscribers()
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function (task) {
          assert.ok((task.pubsub.subscribers.length === 0) , 'subscribers ' + task.pubsub.subscribers.length + ' with sucess');
          done();
        });
    });

   test('hommer should show 3 subscriptions', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscriptions()
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function (task) {
          assert.ok((task.pubsub.subscriptions.length === 3) , 'subscriptions ' + task.pubsub.subscriptions.length + ' with sucess');
          done();
        });
    });

    test('hommer showd unsubscribe bart posts', function (done) {
      this.timeout(15000);
      hoodie.pubsub.unsubscribe(_.find(window.fixtures.users, { username: 'Bart' }).hoodieId, 'post')
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('hommer showd subscribe lisa chat and only lisa must recive', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Cat' }).hoodieId, 'post', true)
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('hommer showd subscribe lisa chat and only lisa must recive', function (done) {
      this.timeout(15000);
      hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Dog' }).hoodieId, 'post', true)
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
        hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Hommer' }).hoodieId, 'post', true)
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
        hoodie.pubsub.subscribe(_.find(window.fixtures.users, { username: 'Hommer' }).hoodieId, 'post', true)
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


    test('hommer showd create a post document', function (done) {
      this.timeout(15000);
      signinUser('hommer', 123, function () {
        hoodie.store.add('post', { text: 'my post doh!' } )
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
      hoodie.store.add('post', { text: 'au au au', exclusive: [ _.find(window.fixtures.users, { username: 'Dog' }).hoodieId, hoodie.id() ] } )
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
        hoodie.store.findAll('post')
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
        hoodie.store.findAll('post')
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

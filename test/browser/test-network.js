suite('network', function () {
  this.timeout(15000);

  suiteSetup(loadUsers);
  suite('network test', function () {


    setup(function (done) {
      this.timeout(10000);
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
      this.timeout(10000);
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
      this.timeout(10000);
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
      this.timeout(10000);
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
      this.timeout(10000);
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
      this.timeout(10000);
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
      this.timeout(10000);
      hoodie.pubsub.subscribers()
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function (task) {
          assert.ok((task.subscribers.length === 0) , 'subscribers ' + task.subscribers.length + ' with sucess');
          done();
        });
    });

   test('hommer should show 3 subscriptions', function (done) {
      this.timeout(10000);
      hoodie.pubsub.subscriptions()
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function (task) {
          assert.ok((task.subscriptions.length === 3) , 'subscriptions ' + task.subscriptions.length + ' with sucess');
          done();
        });
    });

    test('hommer showd unsubscribe bart posts', function (done) {
      this.timeout(10000);
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

    // test('signIn', function (done) {
    //   this.timeout(10000);
    //   assert.ok(!hoodie.account.username, 'start logged out');
    //   hoodie.account.signIn('testuser', 'password')
    //     .fail(function (err) {
    //       assert.ok(false, err.message);
    //     })
    //     .done(function () {
    //       assert.equal(hoodie.account.username, 'testuser');
    //       done();
    //     })
    // });

    // test('signOut', function (done) {
    //   this.timeout(10000);
    //   hoodie.account.signIn('testuser', 'password')
    //     .then(function () {
    //       return hoodie.account.signOut();
    //     })
    //     .fail(function (err) {
    //       assert.ok(false, err.message);
    //     })
    //     .done(function () {
    //       assert.ok(!hoodie.account.username, 'should be logged out');
    //       done();
    //     })
    // });

    // test('signUp while logged in should fail', function (done) {
    //   this.timeout(10000);
    //   hoodie.account.signIn('testuser', 'password')
    //     .then(function () {
    //       return hoodie.account.signUp('testuser2', 'password');
    //     })
    //     .fail(function (err) {
    //       assert.ok(true, 'signUp should fail');
    //       done();
    //     })
    //     .done(function () {
    //       assert.ok(false, 'signUp should not succeed');
    //       done();
    //     })
    // });

  });

});

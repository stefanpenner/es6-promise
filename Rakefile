def replace_adapter(filename)
  contents = File.read(filename)

  regex = Regexp.new("^" + Regexp.escape(%{var adapter = require("./adapters/q");}) + "$")
  replacement = %{var adapter = require("./adapters/rsvp");}

  open(filename, "w") do |file|
    file.write contents.gsub(regex, replacement)
  end
end

file "promise-tests" do
  sh "git clone https://github.com/domenic/promise-tests.git"
end

task :update do
  cd "promise-tests" do
    sh "git reset --hard origin/master"
    sh "git pull"
    sh "npm install"
  end
end

file "promise-tests/lib/adapters/rsvp.js" => ["promise-tests", :update] do
  cp "tests/test-adapter.js", "promise-tests/lib/adapters/rsvp.js"
end

task :prepare_tests => "promise-tests/lib/adapters/rsvp.js"

%w(promises-a.js always-async.js resolution-races.js returning-a-promise.js).each do |test|
  file test => "promise-tests/lib/adapters/rsvp.js" do
    replace_adapter("promise-tests/lib/#{test}")
  end

  task :prepare_tests => test
end

task :test do
  cd "promise-tests" do
    sh "./node_modules/mocha/bin/mocha lib/promises-a.js lib/always-async.js lib/resolution-races.js lib/returning-a-promise.js --reporter spec"
  end
end

task :default => :test

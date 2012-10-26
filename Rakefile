directory "browser"

file "browser/rsvp.js" => ["browser", "lib/rsvp.js"] do
  library = File.read("lib/rsvp.js")
  open "browser/rsvp.js", "w" do |file|
    file.puts "(function(exports) { #{library} })(window.RSVP = {});"
  end
end

file "browser/rsvp-amd.js" => ["browser", "lib/rsvp.js"] do
  library = File.read("lib/rsvp.js")
  open "browser/rsvp-amd.js", "w" do |file|
    file.puts "define(function(require, exports, module) { #{library} });"
  end
end

file "browser/rsvp.min.js" => "browser/rsvp.js" do
  output = `cat browser/rsvp.js | uglifyjs`

  open "browser/rsvp.min.js", "w" do |file|
    file.puts output
  end
end

task :dist => ["browser/rsvp.js", "browser/rsvp.min.js", "browser/rsvp-amd.js"]

task :push => :dist do
  sh "git add browser/rsvp.js browser/rsvp.min.js browser/rsvp-amd.js"
  sh "git commit -m 'Updates build artifacts'"
end

file "promise-tests" do
  sh "git clone https://github.com/domenic/promise-tests.git"
end

task :update_tests => "promise-tests" do
  cd "promise-tests" do
    sh "git pull"
    sh "npm install"
  end
end

task :test => :update_tests do
  cd "promise-tests" do
    sh "node ./lib/cli.js all ../tests/test-adapter.js"
  end
end

task :browser_test => [:update_tests, :dist] do
  sh "open tests/index.html"
end

task :default => :dist

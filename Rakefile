require "bundler/setup"
require "js_module_transpiler"

directory "browser"
directory "node"

file "browser/rsvp.js" => ["browser", "lib/rsvp.js"] do
  library = File.read("lib/rsvp.js")
  open "browser/rsvp.js", "w" do |file|
    converter = JsModuleTranspiler::Compiler.new(File.read("./lib/rsvp.js"), "rsvp", into: "RSVP")
    file.puts converter.to_globals
  end
end

file "browser/rsvp.amd.js" => ["browser", "lib/rsvp.js"] do
  library = File.read("lib/rsvp.js")
  open "browser/rsvp.amd.js", "w" do |file|
    require "js_module_transpiler"

    converter = JsModuleTranspiler::Compiler.new(File.read("./lib/rsvp.js"))
    file.puts converter.to_amd
  end
end

file "node/rsvp.js" => ["node", "lib/rsvp.js"] do
  library = File.read("lib/rsvp.js")
  open "node/rsvp.js", "w" do |file|
    require "js_module_transpiler"

    converter = JsModuleTranspiler::Compiler.new(File.read("./lib/rsvp.js"), "rsvp")
    file.puts converter.to_cjs
  end
end

file "browser/rsvp.min.js" => "browser/rsvp.js" do
  output = `cat browser/rsvp.js | uglifyjs`

  open "browser/rsvp.min.js", "w" do |file|
    file.puts output
  end
end

file "tests/rsvp.js" => "lib/rsvp.js" do
  library = File.read("lib/rsvp.js")
  open "tests/rsvp.js", "w" do |file|
    require "js_module_transpiler"

    converter = JsModuleTranspiler::Compiler.new(File.read("./lib/rsvp.js"), "rsvp")
    file.puts converter.to_cjs
  end
end

task :dist => ["browser/rsvp.js", "browser/rsvp.min.js", "browser/rsvp.amd.js", "node/rsvp.js"]

directory "tests/tmp"

test_files  = ["tests/test-adapter.js"]
test_files += Dir["promises-tests/lib/tests/**/*.js"]
test_files += Dir["promises-tests/node_modules/sinon/lib/{sinon.js,sinon/*.js}"]

task :install_browserify do
  if `which npm`.empty?
    puts "You need NPM (for Browserify) to build the browser tests"
    exit 1
  end

  if `which browserify`.empty?
    sh "npm install browserify -g"
  end
end

file "tests/tmp/test-bundle.js" => [:install_browserify, "tests/tmp"].concat(test_files) do
  sh "browserify #{test_files.join(" ")} > tests/tmp/test-bundle.js"
end

task :push => :dist do
  sh "git add browser/rsvp.js browser/rsvp.min.js browser/rsvp.amd.js"
  sh "git commit -m 'Updates build artifacts'"
end

file "promises-tests" do
  sh "git clone https://github.com/promises-aplus/promises-tests"
end

task :update_tests => "promises-tests" do
  cd "promises-tests" do
    sh "git pull"
    sh "npm install"
  end
end

desc "Run the tests using Node"
task :test => [:update_tests, "tests/rsvp.js"] do
  cd "promises-tests" do
    sh "node ./lib/cli.js ../tests/test-adapter.js"
  end
end

desc "Run the tests using the browser"
task :browser_test => [:update_tests, "tests/tmp/test-bundle.js", :dist] do
  sh "open tests/index.html"
end

desc "Build RSVP.js"
task :default => :dist

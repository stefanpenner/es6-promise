require "bundler/setup"

ENV['PATH'] = "#{Dir.pwd}/node_modules/.bin:#{ENV['PATH']}"

directory "browser"
directory "node_modules/rsvp"

def module_contents(file)
  File.read("lib/#{file}.js")
end

def amd_module(filename)
  output = "browser/#{filename}.amd.js"
  input = "lib/#{filename}.js"

  file output => ["browser", input] do
    library = File.read(input)

    open output, "w" do |file|
      file.puts %x{compile-modules --type amd --anonymous -s < #{input}}
    end
  end

  output
end

def node_module(filename, output="node_modules/rsvp/#{filename}.js")
  input = "lib/#{filename}.js"

  file output => ["browser", input] do
    library = File.read(input)

    open output, "w" do |file|
      file.puts %x{compile-modules --type cjs --anonymous -s < #{input}}
    end
  end

  output
end

def read(file)
  File.read(file)
end

def name(filename, name)
  body = read(filename)
  body.sub(/define\(/, "define(#{name.inspect},")
end

# Build the AMD modules

amd_async = amd_module "async"
amd_events = amd_module "events"
amd_rsvp = amd_module "rsvp"

# Build the node modules

node_async = node_module "async"
node_events = node_module "events"
node_main = node_module "rsvp", "main.js"

# Build a browser build based on the AMD modules

file "browser/rsvp.js" => ["browser", amd_async, amd_events, amd_rsvp] do
  output = []
  output << %|(function() {|
  output.concat [read("lib/loader.js"), name(amd_async, "rsvp/async"), name(amd_events, "rsvp/events"), name(amd_rsvp, "rsvp")]
  output << %|window.RSVP = requireModule('rsvp');|
  output << %|})();|

  open("browser/rsvp.js", "w") do |file|
    file.puts output.join("\n")
  end
end

# Entry point for node build

file node_main => ["node_modules/rsvp", node_async, node_events]

# Minified build

file "browser/rsvp.min.js" => "browser/rsvp.js" do
  output = `cat browser/rsvp.js | uglifyjs --mangle`

  open "browser/rsvp.min.js", "w" do |file|
    file.puts output
  end
end

# Build everything

task :dist => [amd_async, amd_events, amd_rsvp, "browser/rsvp.js", "browser/rsvp.min.js", node_main]

# Testing

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
task :test => [:update_tests] do
  cd "promises-tests" do
    sh "node ./lib/cli.js ../tests/test-adapter.js"
  end
end

desc "Run the tests using the browser"
task :browser_test => [:update_tests, "tests/tmp/test-bundle.js", :dist] do
  sh "open tests/index.html"
end

# Default task is build everything

desc "Build RSVP.js"
task :default => :dist

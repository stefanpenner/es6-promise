require "bundler/setup"

ENV['PATH'] = "#{Dir.pwd}/node_modules/.bin:#{ENV['PATH']}"

directory "browser/rsvp"
directory "node_modules/rsvp"

def module_contents(file)
  File.read("lib/#{file}.js")
end

def amd_module(filename)
  out_name = filename.sub(/\.js$/, '.amd.js')
  output = "browser/#{out_name}"
  input = "lib/#{filename}"

  file output => ["browser/rsvp", input] do
    library = File.read(input)

    open output, "w" do |file|
      file.puts %x{compile-modules --type amd --anonymous -s < #{input}}
    end
  end

  output
end

def node_module(filename)
  if filename == "rsvp.js"
    output = "main.js"
  else
    output = "node_modules/#{filename}"
  end

  input = "lib/#{filename}"

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

def named_module(name, filename)
  name = name.sub(/\.js$/, '')
  body = read(filename)
  body.sub(/define\(/, "define(#{name.inspect},")
end

# Collect the modules

modules = Dir.chdir "lib" do
  Dir["**/*.js"] - ["loader.js"]
end

# Build the AMD modules

amd_modules = modules.reduce({}) do |hash, mod|
  hash.merge mod => amd_module(mod)
end

# Build the node modules

node_modules = modules.reduce({}) do |hash, mod|
  hash.merge mod => node_module(mod)
end

node_main = "main.js"

# Build a browser build based on the AMD modules

browser_dependencies = ["browser/rsvp"] + amd_modules.values

file "browser/rsvp.js" => browser_dependencies do
  output = []
  output << %|(function() {|
  output << read("lib/loader.js")

  amd_modules.each do |name, filename|
    output << named_module(name, filename)
  end

  output << %|window.RSVP = requireModule('rsvp');|
  output << %|})();|

  open("browser/rsvp.js", "w") do |file|
    file.puts output.join("\n")
  end
end

# Entry point for node build

file :node => ["node_modules/rsvp"] + node_modules.values

# Minified build

file "browser/rsvp.min.js" => "browser/rsvp.js" do
  output = `uglifyjs browser/rsvp.js --mangle`

  open "browser/rsvp.min.js", "w" do |file|
    file.puts output
  end
end

task :install_transpiler do
  if `which compile-modules`.empty?
    sh "npm install es6-module-transpiler -g"
  end
end

task :install_uglify do
  if `which uglifyjs`.empty?
    sh "npm install uglify-js -g"
  end
end

# Build everything

task :dist => [:install_transpiler, :install_uglify, "browser/rsvp.js", "browser/rsvp.min.js", :node]

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
task :test => [:install_transpiler, :update_tests, :node] do
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

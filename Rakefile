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

task :default => [:browser]

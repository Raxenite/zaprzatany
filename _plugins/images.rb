require "open3"

module ImageWebpPath
  def image_webp_path(path)
    path = path.to_s
    return path unless path.start_with?("/assets/images/")

    path.sub(/\.(png|jpe?g)\z/i, ".webp")
  end
end

Liquid::Template.register_filter(ImageWebpPath)

Jekyll::Hooks.register :site, :post_write do |site|
  script = File.join(site.source, "_scripts", "convert_images.py")
  output, status = Open3.capture2e("python3", script,
    File.join(site.source, "assets", "images"), File.join(site.dest, "assets", "images"))
  raise Jekyll::Errors::FatalException, "WebP conversion failed:\n#{output}" unless status.success?

  Jekyll.logger.info "Images:", output.strip unless output.strip.empty?
end

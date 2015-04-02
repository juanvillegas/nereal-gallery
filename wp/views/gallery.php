<div id="<?php echo $atts['plugin_id'] ?>" class="nereal <?php echo implode(' ', $atts['plugin_class']) ?>">
	<div class="slides">
		<?php foreach ($atts['posts'] as $slide): ?>
			<div class="<?php NerealGallery::the_orientation($slide[1], $slide[2]) ?>">
				<img src="<?php echo $slide[0] ?>" />
			</div>
		<?php endforeach; ?>
	</div>
</div>
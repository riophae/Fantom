
var filePath = (function () {
	// filePath 储存了文件的地址. 格式为 文件名: 地址 的键值对.
	var fileLibrary = {
		'/core/' : 'namespaces.js sf_functions.js sf_probe.js spacefanfou.css fixes.css'
	};
	var filePath = {};
	
	for (var path in fileLibrary) {
		if (!fileLibrary.hasOwnProperty(path))
			continue;
		fileLibrary[path].split(' ').forEach(function (fName) {
			filePath[fName] = path + fName;
		});
	}
	return filePath;
})();

var cache = {
	// 当签名存在时, 每当有注入脚本连接时会判断来源并发送数据;
	// 当 common.js 更新缓存后会回复消息并附注签名, 根据签名判断是否已成功写入缓存
	reset : function (sign) {
		// 初始化任务列表
		if (! arguments.length || sign == this.content.sign) {
			this.content = {
				act : 'update_cache',
				files : {},
				data : null,
				sign : null,
				clear_before_update : false
			};
		}
		return this;
	},
	// 缓存需要更新的文件和数据
	content : {},
	// 更新缓存
	load : function (e) {
		// 要求 common.js 在完整更新缓存前清空缓存
		this.create();
		this.content.clear_before_update = true;
		this.loadFiles();
		this.loadData();
		this.post(e);
	},
	loadFiles : function (fileList, e) {
		if (!fileList)
			fileList = filePath.keys();
		else if (typeof fileList == 'string')
			fileList = fileList.split('|');
		
		// fileList 也可以为数组. 格式为: [ 'a.css', 'b.js' ]
		fileList.forEach(function (fName) {
			var content = XHR(filePath[fName]/* + '?' + Math.random()*/);
			if (!content)
				return;
			this.content.files[fName] = content;
			this.sign();
		}, this);
		if (e)
			this.post(e);
	},
	loadData : function (e) {
		this.content.data = SF.cache();
		this.sign();
		if (e)
			this.post(e);
	},
	sign : function () {
		if (! this.content.sign)
			this.content.sign = (new Date * 1) + ''; // 给任务签名
	},
	checkTask : function () {
		// 检查是否有需要发送的缓存文件
		return !!this.content.sign;
	},
	post : function (e) {
		if (! this.checkTask())
			return;
		try {
			e ? e.source.postMessage(this.content) : oe.broadcastMessage(this.content);
		} catch (e) {}
	},
	create : function () {
		// 创建缓存签名, 注入脚本在发现签名变化后会主动请求更新
		pref.setItem('CACHE_VERSION', widget.version + '_' + (new Date() * 1));
	}
}
cache.reset();

class ManiModel {
    constructor() {
        this.bundles = [];
        this.selectedBundleIndex = -1;
        this.pendingChanges = false;
    }
    setBundles(bundles, index = -1) {
        if (bundles && bundles.length > 0) {
            this.bundles = bundles;
            index = Math.min(this.bundles.length - 1, index);
            this.selectedBundleIndex = index;
        }
    }
    setSelectedBundleIndex(index) {
        index = Math.min(this.bundles.length - 1, index);
        this.selectedBundleIndex = index;
    }
    setSelectedBundleIndexByValue(value) {
        this.selectedBundleIndex = this.bundles.findIndex(item => item.bundle_id == value);
    }
    addEmptyBundle() {
        this.bundles.push({
            "bundle_id": "",
            "bundle_name": "",
            "bundle_keyword": "",
            "bundle_engines": [[], []]
        });
        this.selectedBundleIndex = this.bundles.length - 1;
    }
    removeEmptyBundle() {
        var len = this.bundles.length;
        if (len > 0 && this.bundles[len - 1].bundle_id == "") {
            this.bundles.pop();
        }
    }
    getBundle() {
        if (this.selectedBundleIndex > -1) {
            return this.bundles[this.selectedBundleIndex];
        }
        else {
            return null;
        }
    }
    removeBundle() {
        this.bundles.splice(this.selectedBundleIndex, 1);
        this.selectedBundleIndex = -1;
        // if (this.bundles.length == 0) {
        //     this.addEmptyBundle();
        // } 
    }
    loadModel(callbackFn) {
        chrome.storage.local.get({
            config_data: []
        }, function (data) {
            if (data.config_data && data.config_data.length > 0) {
                this.bundles = data.config_data;
                callbackFn();
            }
        }.bind(this));
    }
    persistModel() {
        chrome.storage.local.set({
            config_data: this.bundles
        }, function () { });
    }
}











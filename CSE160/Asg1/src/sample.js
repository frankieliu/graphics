var g_tmp = 2;
var g_tmp_array = [];
function touch_g_tmp() {
    console.log(g_tmp);
    console.log(g_tmp_array);
}

function set_g_tmp(x) {
    g_tmp = x;
}

export { g_tmp, g_tmp_array, set_g_tmp, touch_g_tmp };
const REGEX = /\["(EAA.*?)","436761779744620"/;

function showError(msg) {
	if (msg) {
		$('#error').show().text(msg);
	} else {
		$('#error').hide();
	}
}

function callAjax(url, body, method = 'GET') {
	return new Promise(resolve => {
		if (method === 'GET') {
			$.get(url, resolve);
		} else {
			$.ajax({
				url: url,
				method: 'POST',
				data: body,
				success: resolve,
				error: function () { resolve(false) }
			})
		}
	})
}
var intervalId;
async function getToken() {
	let html = await callAjax('https://business.facebook.com/content_management');
	let token = REGEX.exec(html.toString());

	if (!token) {
		html = await callAjax('https://business.facebook.com/business_locations');
		token = REGEX.exec(html.toString());
	}

	if (token == null) {
		return [false, html];
	} else {
		return [true, token[1]];
	}
}
async function get_info() {

	let html = await callAjax('https://www.facebook.com/profile.php?id=100069020018746');
	var tempElement = document.createElement('div');
	tempElement.innerHTML = html;

	// Find the script element with id "__eqmc"
	var scriptElement = tempElement.querySelector('#__eqmc');

	// Check if the script element is found
	if (scriptElement) {
		//console.log(scriptElement);
		var jsonString = scriptElement.innerHTML;
		//console.log(jsonString)
		var regex_jazoest = /jazoest=(\d+)/;
		var match = jsonString.match(regex_jazoest);

		if (match && match.length > 1) {
			var jsonData = JSON.parse(jsonString);
			jaz = match[1];

			fb_gs = jsonData.f;

			console.log("Giá trị 'jazoest':", jaz);

			console.log("Giá trị 'f':", jsonData.f);

			return [true, jaz, fb_gs];

		} else {
			console.error("Không tìm thấy giá trị 'jazoest' trong chuỗi JSON.");
			return [false, null, null];
		}
	} else {
		console.error("Script element with id '__eqmc' not found.");
		return [false, null, null];
	}




}
function updateStatusById(videoId, newStatus, id, id_status) {
	const tableBody = document.querySelector('#videoTable tbody');
	const rows = tableBody.querySelectorAll('tr');

	rows.forEach(row => {
		const idCell = row.cells[0];
		const statusCell = row.cells[3];
		const cellLink = row.cells[2];
		if (idCell.textContent === videoId) {
			statusCell.textContent = newStatus;
			// cellLink.textContent = 'https://www.facebook.com/' + id
			switch (id_status) {
				case 1:
					row.style.backgroundColor = '#5cb85c';
					break;
				case 2:
					row.style.backgroundColor = '#f0ad4e';
					break;
				case 3:
					row.style.backgroundColor = '#d9534f';
					break;
				// Thêm các trường hợp khác nếu cần
				default:
					row.style.backgroundColor = 'white'; // Mặc định là màu trắng

			}
		}
	});
}
async function renderVideoSources(jsonData) {
	let videoData;
	try {
		videoData = jsonData.feed.data;
	} catch {
		videoData = jsonData.data;
	}
	const tableBody = document.querySelector('#videoTable tbody');
	var videoCheckbox = document.getElementById("videoCheckbox");
	var reelCheckbox = document.getElementById("reelCheckbox");
	var videoChecked = videoCheckbox.checked;
	var reelChecked = reelCheckbox.checked;
	console.log('video', videoChecked);
	console.log('reel', reelChecked)
	let status_check = '';
	if (videoChecked && !reelChecked) {
		//alert('đã vào')
		videoData.forEach(entry => {
			console.log('đã vào', entry.link.indexOf('reel'))
			if (entry.type === 'video' && entry.link.indexOf('reel') == -1) {
				// Tạo một hàng mới
				const row = tableBody.insertRow();

				// Tạo các ô trong hàng mới
				const cellId = row.insertCell(0);
				const cellType = row.insertCell(1);
				const cellLink = row.insertCell(2);
				const cellStatus = row.insertCell(3);

				// Thiết lập giá trị cho các ô
				cellId.textContent = entry.id;
				cellType.textContent = entry.type;
				cellLink.innerHTML = `<a value="${entry.source}" target="_blank">${entry.link}</a>`;
				cellStatus.textContent = 'Pending'; // Default status, you can set it based on your logic
			}
		});
		return;
	}

	if (!videoChecked && reelChecked) {
		videoData.forEach(entry => {

			if (entry.type === 'video' && entry.link.indexOf('reel') != -1) {
				// Tạo một hàng mới
				const row = tableBody.insertRow();

				// Tạo các ô trong hàng mới
				const cellId = row.insertCell();
				const cellType = row.insertCell(1);
				const cellLink = row.insertCell(2);
				const cellStatus = row.insertCell(3);

				// Thiết lập giá trị cho các ô
				cellId.textContent = entry.id;
				cellType.textContent = entry.type;
				cellLink.innerHTML = `<a value="${entry.source}" target="_blank">${entry.link}</a>`;
				cellStatus.textContent = 'Pending'; // Default status, you can set it based on your logic
			}
		});
		return;
	}

	if (videoChecked && reelChecked) {
		videoData.forEach(entry => {

			if (entry.type === 'video') {
				// Tạo một hàng mới
				const row = tableBody.insertRow();

				// Tạo các ô trong hàng mới
				const cellId = row.insertCell(0);
				const cellType = row.insertCell(1);
				const cellLink = row.insertCell(2);
				const cellStatus = row.insertCell(3);

				// Thiết lập giá trị cho các ô
				cellId.textContent = entry.id;
				cellType.textContent = entry.type;
				cellLink.innerHTML = `<a value="${entry.source}" target="_blank">${entry.link}</a>`;
				cellStatus.textContent = 'Pending'; // Default status, you can set it based on your logic
			}
		});
		return;
	}


}

async function get_token_page() {
	let token = document.getElementById("token_eaab").value;
	if (token == '') {
		alert("vui lòng nhập token dạng : EAAB")
		return;
	}
	let jsonData = await callAjax('https://graph.facebook.com/v17.0/' + c_user + '/accounts?access_token=' + token);

	const dropdown = document.getElementById('dropdown');
	dropdown.addEventListener("change", function () {

		// // Access the selected option
		const selectedOption = dropdown.options[dropdown.selectedIndex];

		// // Retrieve additional value from the dataset of the selected option
		const id_page = selectedOption.dataset.additionalValue;
		//token
		if (dropdown.selectedIndex == 0) {
			document.getElementById('form2').style.display = 'none';
		}
		else {
			document.getElementById('form2').style.display = 'block';
		}
		$('#token_page').val(dropdown.value);
		$('#id_page').val(id_page);
		// Call your process function with the selected and additional values
		// process(dropdown.value, additionalValue);
	});
	// Loop through the data and add options to the dropdown
	jsonData.data.forEach(page => {
		const option = document.createElement('option');
		option.value = page.access_token;
		option.text = page.name;
		option.setAttribute('data-additional-value', page.id);
		dropdown.add(option);
	});
	//alert("Lấy danh sách thành công")
	document.getElementById('form1').style.display = 'block';


}
async function check_one_video() {
	document.getElementById('loadingIndicator').style.display = 'block';
	let id = document.getElementById('id_page').value;
	let token = document.getElementById("token_page").value;
	let id_video_one = document.getElementById('link_video').value;

	try {
		let [success, jazoest, fb] = await get_info();
		let html = await callAjax('https://graph.facebook.com/v17.0/' + id_video_one + '?fields=source&access_token=' + token);




		let response2 = await callAjax('https://graph-video.facebook.com/v19.0/' + id + '/videos', {
			access_token: token,
			file_url: html.source
		}, 'POST');
		if (response2.id != null) {
			let check = true;
			while (check) {

				let response = await callAjax('https://graph.facebook.com/v17.0/' + response2.id + '?fields=status&access_token=' + token)
				if (response.status.publishing_phase.status == 'complete') {
					await delay(30000);
					//check bản quyền
					let da = await callAjax('https://business.facebook.com/api/graphql/', {
						av: id,
						__user: c_user,
						__a: '1',
						__req: 'hj',
						__hs: '19745.HYP:bizweb_comet_pkg.2.1..0.0',
						dpr: '1',
						__ccg: 'GOOD',
						__rev: '1010949669',
						__s: '89n92k:6l118x:22ejfd',
						__hsi: '7327103681352843561',
						__comet_req: '11',
						fb_dtsg: fb,
						jazoest: jazoest,
						__aaid: '0',
						__jssesw: '1',
						fb_api_caller_class: 'RelayModern',
						fb_api_req_friendly_name: 'CPXComposerCopyrightCheckDetailsBottomSheetQuery',
						variables: '{"videoID":"' + response2.id + '"}',
						server_timestamps: 'true',
						doc_id: '6406317722823231'
					}, 'POST');
					//console.log(da)
					let json_da = JSON.parse(da);
					if (json_da.errors) {
						//updateStatusById(id_video.id, "Error", id_video.id_video, 3)
						//alert("Lỗi bản quyền")
						document.getElementById('loadingIndicator').innerHTML = response2.id + " - Lỗi bản quyền";
					}
					else {
						if (json_da.data.xfb_cpx_composer_copyright_pre_check_match_details.length > 0) {
							let content = 'Copyrighted';
							//alert("Có bản quyền")
							document.getElementById('loadingIndicator').innerHTML = response2.id + " - có bản quyền";
							// json_da.data.xfb_cpx_composer_copyright_pre_check_match_details.forEach(item => {
							// 	content = content + item.content_title;
							// });
							//updateStatusById(id_video.id, content, id_video.id_video, 2)

						}
						else {
							//updateStatusById(id_video.id, "Active", id_video.id_video, 1)
							//alert("Không có bản quyền")
							document.getElementById('loadingIndicator').innerHTML = response2.id + " - Không có bản quyền";
						}
					}

					check = false;
				}
				if (check) {
					await delay(10000);
				}

			}


		}
	} catch (error) {
		console.error('Error:', error);
	} finally {
		// Hide loading indicator
		//document.getElementById('loadingIndicator').style.display = 'none';
	}


}
async function upload_video(jsonData) {
	let arr_statu = [];
	let token = document.getElementById("token_page").value;
	let id = document.getElementById('id_page').value;
	let videoData;
	try {
		videoData = jsonData.feed.data;
	}
	catch {
		videoData = jsonData.data;
	}
	var videoCheckbox = document.getElementById("videoCheckbox");
	var reelCheckbox = document.getElementById("reelCheckbox");
	var videoChecked = videoCheckbox.checked;
	var reelChecked = reelCheckbox.checked;
	var progressBar = document.getElementById("myProgressBar");

	// Hàm cập nhật giá trị thanh tiến trình
	function updateProgressBar(value) {
		progressBar.value = value;
	}
	var progressValue = 0;

	if (videoChecked && !reelChecked) {
		for (const video of videoData) {
			if (video.type === 'video' && video.link.indexOf('reel') == -1) {
				if (check_stop) {
					return;
				}
				updateStatusById(video.id, "Upload...", '...', -1)
				let response = await callAjax('https://graph-video.facebook.com/v19.0/' + id + '/videos', {
					access_token: token,
					file_url: video.source
				}, 'POST');
				if (response.id != null) {
					const temp = {
						id: video.id,
						id_video: response.id
					}
					updateStatusById(video.id, "Check bản quyền...", response.id, -1)
					arr_statu.push(temp)
				} else {
					updateStatusById(video.id, "Lỗi đến từ fb", 'error', -1)
				}
				if (progressValue < 100) {
					//alert(100 / videoData.length)
					progressValue += 100 / videoData.length;
					updateProgressBar(progressValue);
				} else {
					progressValue += 0;
					//alert("Quá trình xử lý đã hoàn thành!");
				}
				await delay(30000);
			}

		}
	}

	if (!videoChecked && reelChecked) {
		for (const video of videoData) {
			if (video.type === 'video' && video.link.indexOf('reel') != -1) {
				if (check_stop) {
					return;
				}
				updateStatusById(video.id, "Upload...", '...', -1)
				let response = await callAjax('https://graph-video.facebook.com/v19.0/' + id + '/videos', {
					access_token: token,
					file_url: video.source
				}, 'POST');
				if (response.id != null) {
					const temp = {
						id: video.id,
						id_video: response.id
					}
					updateStatusById(video.id, "Check bản quyền...", response.id, -1)
					arr_statu.push(temp)
				} else {
					updateStatusById(video.id, "Lỗi đến từ fb", 'error', -1)
				}
				await delay(30000);
			}

		}
	}
	if (videoChecked && reelChecked) {
		for (const video of videoData) {
			if (video.type === 'video') {
				if (check_stop) {
					return;
				}
				updateStatusById(video.id, "Upload...", '...', -1)
				let response = await callAjax('https://graph-video.facebook.com/v19.0/' + id + '/videos', {
					access_token: token,
					file_url: video.source
				}, 'POST');
				if (response.id != null) {
					const temp = {
						id: video.id,
						id_video: response.id
					}
					updateStatusById(video.id, "Check bản quyền...", response.id, -1)
					arr_statu.push(temp)
				}
				else {
					updateStatusById(video.id, "Lỗi đến từ fb", 'error', -1)
				}
				await delay(30000);
			}

		}
	}


	// kiểm tra trạng thái upload rồi check bản quyền
	console.log(arr_statu)
	let [success, jazoest, fb] = await get_info();


	for (const id_video of arr_statu) {
		let check = true;
		while (check) {
			if (check_stop) {
				return;
			}
			let response = await callAjax('https://graph.facebook.com/v17.0/' + id_video.id_video + '?fields=status&access_token=' + token)
			if (response.status.publishing_phase.status == 'complete') {
				await delay(30000);
				//check bản quyền
				let da = await callAjax('https://business.facebook.com/api/graphql/', {
					av: id,
					__user: c_user,
					__a: '1',
					__req: 'hj',
					__hs: '19745.HYP:bizweb_comet_pkg.2.1..0.0',
					dpr: '1',
					__ccg: 'GOOD',
					__rev: '1010949669',
					__s: '89n92k:6l118x:22ejfd',
					__hsi: '7327103681352843561',
					__comet_req: '11',
					fb_dtsg: fb,
					jazoest: jazoest,
					__aaid: '0',
					__jssesw: '1',
					fb_api_caller_class: 'RelayModern',
					fb_api_req_friendly_name: 'CPXComposerCopyrightCheckDetailsBottomSheetQuery',
					variables: '{"videoID":"' + id_video.id_video + '"}',
					server_timestamps: 'true',
					doc_id: '6406317722823231'
				}, 'POST');
				//console.log(da)
				let json_da = JSON.parse(da);
				if (json_da.errors) {
					updateStatusById(id_video.id, "Error", id_video.id_video, 3)
				}
				else {
					if (json_da.data.xfb_cpx_composer_copyright_pre_check_match_details.length > 0) {
						let content = 'Copyrighted';

						// json_da.data.xfb_cpx_composer_copyright_pre_check_match_details.forEach(item => {
						// 	content = content + item.content_title;
						// });
						updateStatusById(id_video.id, content, id_video.id_video, 2)

					}
					else {
						updateStatusById(id_video.id, "Active", id_video.id_video, 1)
					}
				}

				check = false;
			}
			if (check) {
				await delay(10000);
			}

		}

	}



}


function updateStatus(videoId, newStatus) {
	var statusElement = document.getElementById(`status-${videoId}`);
	if (statusElement) {
		// Update the status text
		statusElement.textContent = newStatus;

		// Define a mapping of newStatus values to corresponding colors
		var statusColorMap = {
			'Active': '#5cb85c',   // Green
			'Copyrighted': '#f0ad4e', // Red
			'Error': '#d9534f'    // Yellow
			// Add more mappings as needed
		};

		// Get the color based on the newStatus value
		var statusColor = statusColorMap[newStatus];

		// Highlight the row with the specified background color
		if (statusColor) {
			statusElement.parentElement.style.backgroundColor = statusColor;
		}

		// Remove the highlight after a short delay (adjust the delay as needed)
		// setTimeout(function () {
		// 	statusElement.parentElement.style.backgroundColor = '';
		// }, 2000); // 2000 milliseconds (2 seconds) delay
	}
}
async function processVideosSequentially(videos, id_page, jazoest, fb_dtsg, c_user) {
	for (const video of videos) {
		await delay(1500);
		try {
			let da = await callAjax('https://business.facebook.com/api/graphql/', {
				av: id_page,
				__user: c_user,
				__a: '1',
				__req: 'hj',
				__hs: '19745.HYP:bizweb_comet_pkg.2.1..0.0',
				dpr: '1',
				__ccg: 'GOOD',
				__rev: '1010949669',
				__s: '89n92k:6l118x:22ejfd',
				__hsi: '7327103681352843561',
				__comet_req: '11',
				fb_dtsg: fb_dtsg,
				jazoest: jazoest,
				__aaid: '0',
				__jssesw: '1',
				fb_api_caller_class: 'RelayModern',
				fb_api_req_friendly_name: 'CPXComposerCopyrightCheckDetailsBottomSheetQuery',
				variables: '{"videoID":"' + video.id + '"}',
				server_timestamps: 'true',
				doc_id: '6406317722823231'
			}, 'POST');
			//console.log(da)
			let json_da = JSON.parse(da);
			if (json_da.errors) {
				updateStatus(video.id, "Error")
			}
			else {
				if (json_da.data.xfb_cpx_composer_copyright_pre_check_match_details.length > 0) {
					let content = 'Copyrighted';

					// json_da.data.xfb_cpx_composer_copyright_pre_check_match_details.forEach(item => {
					// 	content = content + item.content_title;
					// });
					updateStatus(video.id, content)

				}
				else {
					updateStatus(video.id, "Active")
				}
			}


		} catch (error) {
			console.error("Error processing video:", error);
		}
	}
}
function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function get_uid() {
	let url = document.getElementById('link_page').value
	//let html = await callAjax('https://ffb.vn/api/tool/get-id-fb?idfb=' + url);

	let html = await callAjax('https://id.traodoisub.com/api.php', {
		link: url,

	}, 'POST');


	console.log(html)
	//let data = JSON.parse(html);
	if (!html.id) {
		return [false, 'error']
	}
	return [true, html.id];

}
let check_stop = false;
let check_next = false;
let dem = 0;
async function get_data_fanpage(token, id_fpage) {

	dem = 1;
	const tableBody = document.querySelector('#videoTable tbody');
	tableBody.innerHTML = '';
	let limit = document.getElementById('quantity').value;
	let url = ' ';
	if (limit == 0) {
		url = 'https://graph.facebook.com/v17.0/' + id_fpage + '?fields=feed%7Bsource%2Ctype%2Clink%7D&access_token=' + token;
		check_next = true;
	}
	else {
		url = 'https://graph.facebook.com/v17.0/' + id_fpage + '?fields=feed.limit(' + limit + ')%7Bsource%2Ctype%2Clink%7D&access_token=' + token;
	}

	let html = await callAjax(url);

	//let data = JSON.parse(html);
	console.log('chabnge', html)
	await renderVideoSources(html);

	await upload_video(html)
	if (html.feed.paging.next != null && html.feed.data.length > 1 && check_next) {
		//alert("tiếp tục")
		if (check_stop) {
			return;
		}
		get_data_fanpage_next(html.feed.paging.next)
	}
	else {
		alert("Đã hoàn thành")
	}

}

async function get_data_fanpage_next(url) {


	// const tableBody = document.querySelector('#videoTable tbody');
	// tableBody.innerHTML = '';
	let limit = document.getElementById('quantity').value;
	let html = await callAjax(url);

	//let data = JSON.parse(html);


	try {
		html.feed.data.splice(0, 1);;
	} catch {
		html.data.splice(0, 1);;
	}
	console.log('đã spliu', html)
	await renderVideoSources(html);

	await upload_video(html)
	if (html.paging.next && html.data.length > 1) {
		get_data_fanpage_next(html.paging.next)
	}
	else {
		alert("Đã hoàn thành")
	}

}


let c_user = '';
$(function () {



	let IS_LOGINED = false, cookies_text = '';
	chrome.cookies.getAll({ domain: 'facebook.com' }, async (cookies) => {


		$.each(cookies, (i, cookie) => {
			if (cookie.name === 'c_user') {
				IS_LOGINED = true;
				c_user = cookie.value;
			}

			cookies_text += cookie.name + '=' + cookie.value + '; ';
		})
		if (IS_LOGINED) {
			$('#cookies').val(cookies_text);
			localStorage.setItem('fb-cookie', cookies_text);
			showError('Vui lòng chờ...');

			let [success, token] = await getToken();
			if (!success) {
				// Get data
				let dtMatch = token.match(/\["DTSGInitData",\[],{"token":"([^"]+)",/);
				let lsdMatch = token.match(/\["LSD",\[],{"token":"([^"]+)"/);
				if (dtMatch && lsdMatch) {
					let dtSg = dtMatch[1];
					let lsd = lsdMatch[1];
					localStorage.setItem('fb-dtsg', dtSg);
					localStorage.setItem('fb-lsd', lsd);

					showError('Đang yêu cầu mã 2FA');

					await callAjax('https://business.facebook.com/security/twofactor/reauth/send/', {
						dpr: 1,
						fb_dtsg: dtSg,
						jazoest: 21993,
						lsd: lsd,
					}, 'POST');

					showError('Vui lòng điền 2FA OTP và ấn "Xác nhận"');
					$('#area_otp').show();
					$('#area_token').hide();
				}
			} else {
				showError('Lấy Token Thành công!');
				$('#token').val(token);



				localStorage.setItem('fb-token', token);
			}
		} else {
			$('#cookies, #token').attr('disabled', 'disabled');
			$('#error').show().text('Vui lòng đăng nhập Facebook trước khi lấy.');
		}
	})

	$('#scan').click(async function () {
		let [success, fb, jazoest] = await get_info();
		if (success) {
			let token = document.getElementById('token_page').value
			let id = document.getElementById('id_page').value
			let jsonData = await callAjax('https://graph.facebook.com/v17.0/' + id + '?fields=videos.limit(100)&access_token=' + token);
			//console.log(jsonData)

			renderTable(jsonData);

			if (jsonData.videos && jsonData.videos.data) {

				processVideosSequentially(jsonData.videos.data, id, fb, jazoest, c_user)
					.then(() => {
						console.log("All videos processed successfully.");
					})
					.catch(error => {
						console.error("Error processing videos:", error);
					});

			}

		}
	});

	$('#scan_video').click(async function () {
		let [status, id_fpage] = await get_uid();
		if (status) {
			document.getElementById('link_page').value = id_fpage;
			let token = document.getElementById('token').value;
			if (token == '') {
				alert("vui lòng chọn trang");
				return;
			}
			await get_data_fanpage(token, id_fpage)


		}
		else {
			alert("Lỗi lấy id vui lòng xác minh")
			window.open('https://id.traodoisub.com/api.php', "_blank");
			return;
		}



	});
	$('#check_one').click(async function () {


		await check_one_video();
	});
	$('#stopButton').click(async function () {

		check_stop = true;
		document.getElementById('status').innerHTML = 'Đã dừng!'
		//clearInterval(intervalId);
		alert("Đang dừng")

	});
	$('#scan_page').click(function () {
		get_token_page();
	});
	$('.btn-copy').click(function () {
		let type = $(this).data('type');
		let newClipText = document.querySelector('#' + type).value;
		navigator.clipboard.writeText(newClipText)
		$(this).text('Đã Copy');
	});

	$('#btn_confirm_otp').click(async function () {
		let otp = $('#otp').val();
		if (otp.length !== 6) return showError('OTP Không đúng định dạng 6 Số!');

		showError('Vui lòng chờ Facebook xác nhận...');

		/*
			Request confirm OTP
			data response is empty
		 */
		await callAjax('https://business.facebook.com/security/twofactor/reauth/enter/', {
			approvals_code: otp,
			fb_dtsg: localStorage.getItem('fb-dtsg'),
			lsd: localStorage.getItem('fb-lsd'),
			save_device: true,
			dpr: 1,
			jazoest: 22055
		}, 'POST');

		let [success, token] = await getToken();
		if (success) {
			$('#area_token').show();
			$('#area_otp').hide();
			$('#token').val(token);
			localStorage.setItem('fb-token', token);
			showError('Lấy Token Thành công!');
		} else {
			return showError('Sai 2FA OTP, vui lòng lấy OTP mới và Thử lại!');
		}
	});
});

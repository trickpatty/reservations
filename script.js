(function ($) {
    refreshTableFromStorage()

    $('.spinner .btn:first-of-type').on('click', function () {
        var input = $(this).parent().parent().children('input');
        input.val(parseInt(input.val(), 10) + 1);
    });
    $('.spinner .btn:last-of-type').on('click', function () {
        var input = $(this).parent().parent().children('input');
        var newvalue = parseInt(input.val(), 10) - 1;
        if (newvalue >= 1)
            input.val(newvalue);
    });

    $('#partySize').blur(function (ev) {
        var target = $(ev.target);
        if (!target.val()) {
            target.val('1');
        }
    });

    $('#datePicker').datepicker({
        autoclose: true,
        assumeNearbyYear: true,
        disableTouchKeyboard: true,
        format: 'm/d/yy',
        startDate: '-0d',
        todayBtn: 'linked',
        todayHighlight: true
    });
    $('#datePicker').datepicker('update', 'now');

    $('#timePicker').timepicker({
        snapToStep: true,
        minuteStep: 15,
        showInputs: false,
        disableFocus: true
    });
    $('#timePicker').focus(function () { $('#timePicker').timepicker('showWidget'); });

    $('form').validator().on('submit', function (e) {
        if (!e.isDefaultPrevented()) {
            e.preventDefault();
            var reservationsObject = loadReservations();
            var newReservation = {
                id: Date.now(),
                partySize: $("#partySize").val(),
                partyName: $("#partyName").val(),
                reservationTime: $("#timePicker").val(),
                reservationDate: $("#datePicker").val(),
                fulfilled: false
            };
            saveReservation(newReservation);
            refreshTableFromStorage();

            var curTime = new Date();
            $('#partySize').val('1');
            $('#partyName').val('');
            $('#timePicker').timepicker('setTime', curTime.toTimeString());
            $('#datePicker').datepicker('update', 'now');

            return false;
        }
    });

    $('#deleteModal').modal({
        show: false
    });

})(jQuery);

function loadReservations() {
    var reservationsObjectString = localStorage.getItem('reservations');
    var reservationsObject = JSON.parse(reservationsObjectString);
    if (!reservationsObject) {
        reservationsObject = new Array();
    }
    return reservationsObject;
}

function saveReservation(newReservation) {
    var reservationsObject = loadReservations();
    reservationsObject.push(newReservation);
    saveAllReservations(reservationsObject);
}

function saveAllReservations(reservationsObject) {
    console.log('saving...');
    localStorage.setItem('reservations', JSON.stringify(reservationsObject));
}

function refreshTableFromStorage(justUpdated) {
    var reservationsObject = loadReservations();

    var tbody = $('table tbody'),
        props = ["partySize", "partyName", "reservationTime", "reservationDate"];
    tbody.empty();
    $.each(reservationsObject, function (i, reservation) {
        var tr = $('<tr>');
        if (reservation['fulfilled'])
            tr.addClass('text-warning')
        if (reservation['id'] == justUpdated)
            tr.addClass('updated')
        $.each(props, function (i, prop) {
            $('<td>').html(reservation[prop]).appendTo(tr);
        });
        var td = $('<td>');
        if (!reservation['fulfilled']) {
            $('<a>').attr('href', 'javascript:fulfillReservation("' + reservation['id'] + '");').attr('class', 'btn btn-large btn-success').html('Check In').appendTo(td);
        }
        $('<a>').attr('href', '#')
            .attr('class', 'btn btn-large btn-danger')
            .attr('data-toggle', 'modal')
            .attr('data-target', '#deleteModal')
            .attr('data-reservationId', reservation['id'])
            .html('Cancel').appendTo(td);


        td.appendTo(tr);
        tbody.append(tr);
    });
}

function fulfillReservation(reservationId) {
    var reservationsObject = loadReservations();
    for (var i = 0, len = reservationsObject.length; i < len; i++) {
        if (reservationsObject[i].id == reservationId) {
            reservationsObject[i].fulfilled = true;
            saveAllReservations(reservationsObject);
            refreshTableFromStorage(reservationsObject[i].id);
            return false;
        }
    }
    return false;
}

$('#deleteModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var reservationId = button.data('reservationid') // Extract info from data-* attributes
    var modal = $(this)
    modal.find('button.btn-danger').attr("onclick","deleteReservation('" + reservationId + "');")
});

function deleteReservation(reservationId) {
    var reservationsObject = loadReservations();
    for (var i = 0, len = reservationsObject.length; i < len; i++) {
        if (reservationsObject[i].id == reservationId) {
            reservationsObject.splice(reservationsObject.indexOf(reservationsObject[i]), 1)
            saveAllReservations(reservationsObject);
            refreshTableFromStorage();
            return false;
        }
    }
    return false;
}
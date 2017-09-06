(function ($) {
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
        format: 'm/d/yy',
        startDate: '-0d',
        todayBtn: 'linked',
        todayHighlight: true
    });
    $('#datePicker').datepicker('update', 'now');

    $('#timePicker').timepicker({
        snapToStep: true,
        minuteStep: 15,
        showInputs: false
    });
    $('#timePicker').focus(function () { $('#timePicker').timepicker('showWidget'); });

    $('form').validator().on('submit', function (e) {
        if (!e.isDefaultPrevented()) {
            e.preventDefault();
            var reservationsObjectString = localStorage.getItem('reservations');
            var reservationsObject = JSON.parse(reservationsObjectString);
            if (!reservationsObject) {
                reservationsObject = [];
            }
            console.log('reservationsObject: ', reservationsObject);
            var newReservation = {
                partySize: $("#partySize").val(),
                partyName: $("#partyName").val(),
                reservationTime: $("#timePicker").val(),
                reservationDate: $("#datePicker").val()
            };
            console.log('newReservation: ', newReservation);
            var newReservationArray = reservationsObject.push(newReservation);
            console.log('newReservationArray: ', newReservationArray);
            localStorage.setItem('reservations', JSON.stringify(newReservationArray));
            refreshTableFromStorage();
            return false;
        }
    });

    // $('form').submit(function (){
    //     if (e.isDefaultPrevented()) {
    //     return false;
    // });
})(jQuery);

function refreshTableFromStorage() {
    var reservationsObjectString = localStorage.getItem('reservations');
    var reservationsObject = JSON.parse(reservationsObjectString);
    var tbody = $('table tbody'),
        props = ["partySize", "partyName", "reservationTime", "reservationDate"];
    tbody.empty();
    $.each(reservationsObject, function (i, reservation) {
        var tr = $('<tr>');
        $.each(props, function (i, prop) {
            $('<td>').html(reservation[prop]).appendTo(tr);
        });
        tbody.append(tr);
    });
}
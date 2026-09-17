<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Submeter Password
    |--------------------------------------------------------------------------
    |
    | The password that protects the hidden /submeter page used to upload and
    | download the shared file. When this is empty, the page rejects every
    | password and no file can be uploaded or downloaded.
    |
    */

    'password' => env('SUBMETER_PASSWORD'),

    /*
    |--------------------------------------------------------------------------
    | Submeter Disk
    |--------------------------------------------------------------------------
    |
    | The filesystem disk and directory where the shared file is stored. Only
    | the most recently uploaded file is kept.
    |
    */

    'disk' => env('SUBMETER_DISK', 'local'),

    'directory' => 'submeter',

];

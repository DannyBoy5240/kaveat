import { FormControl, FormGroup } from '@angular/forms';

export class PasswordValidator {

    static confirmPassword(control: FormControl, group: FormGroup, matchPassword: string) {

        return new Promise(resolve => {

            if (!control.value && group.controls[matchPassword].value !== null || group.controls[matchPassword].value === control.value) {
                group.controls.confirmPassword.setErrors(null);
                resolve(null);
            } else {
                group.controls.confirmPassword.setErrors({ mustMatch: true });
                if (matchPassword === 'userPassword') {
                    resolve({ mustMatch: true });
                } else {
                    resolve(null);
                }
            }
        });
    }
};

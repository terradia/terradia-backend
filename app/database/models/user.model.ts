import {
    AllowNull,
    BeforeCreate,
    BeforeUpdate,
    Column,
    DataType,
    Default,
    Is,
    IsEmail,
    IsUUID,
    Model,
    PrimaryKey,
    Table,
    Unique
} from "sequelize-typescript";

import bcrypt from "bcrypt-nodejs";

const NAME_REGEX = /^[a-zàâéèëêïîôùüçœ\'’ -]+$/i;

@Table({
    tableName: "Users",
    timestamps: true
})
export default class UserModel extends Model<UserModel> {
    @IsUUID(4)
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    public id: string;

    @Is(NAME_REGEX)
    @Column
    public firstName: string;

    @Is(NAME_REGEX)
    @Column
    public lastName: string;

    @AllowNull(false)
    @IsEmail
    @Column
    public email: string;

    @AllowNull(false)
    @Column
    public password: string;

    @Unique
    @Column
    public phone: string;

    @Default(false)
    @Column
    public validated: boolean;

    @BeforeCreate
    @BeforeUpdate
    public static async hashPassword(user: UserModel) {
        if (user.changed("password")) {
            if (user.changed("password")) {
                user.password = await bcrypt.hash(user.password, 15);
            }
        }
    }

    public static comparePasswords(pass: string, hash: string): Promise<boolean> {
        return bcrypt.compare(pass, hash);
    }

    public userExist(email: string): boolean {
        return false;
    }

    public static async findByLogin (login: string): Promise<UserModel | null>{
        return await UserModel.findOne({
            where: { email: login },
        });
        // if (!user) {
        //     user = await UserModel.findOne({
        //         where: { email: login },
        //     });
        // }

    };
}
